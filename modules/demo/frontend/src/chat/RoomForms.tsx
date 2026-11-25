import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  EVENT_ATTENDEES_MAX,
  EVENT_TITLE_MAX,
  ROOM_DESCRIPTION_MAX,
  ROOM_NAME_MAX,
  ROOMS_OWNED_MAX,
  eventProblem,
  normalizeRoomName,
  roomNameProblem,
  type RoomRole,
} from "./rooms";
import type { IRoomForms } from "./useChat";

/**
 * Les formulaires du chat : créer un salon, inviter, planifier.
 *
 * Guide pour un agent : chaque formulaire est une boîte `<dialog>` NATIVE —
 * piège du focus, touche Échap et retour du focus au bouton qui l'a ouverte
 * sont fournis par le navigateur, sans bibliothèque. Les règles (bornes,
 * créneau, nom réservé) viennent de `rooms.ts`, les MÊMES que le serveur
 * applique : la page prévient, le serveur décide. Un refus du serveur (403,
 * 404, 409, 422) s'affiche sous le champ qu'il concerne. Doc :
 * `@nodefony/realtime/docs/canaux-a-membres.md`.
 */

/** Le message d'un refus, quel que soit le chemin (socket ou HTTP). */
function messageOf(error: unknown): string {
  return error instanceof Error && error.message !== ""
    ? error.message
    : "le serveur a refusé";
}

/** « 2026-11-13T15:00 », l'heure LOCALE qu'attend `<input type="datetime-local">`. */
function toLocalInput(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** L'instant d'une saisie `datetime-local`, lue dans le fuseau du navigateur. */
function fromLocalInput(value: string): number {
  return value === "" ? Number.NaN : new Date(value).getTime();
}

/** Le fuseau du navigateur, gardé avec l'événement (`Europe/Paris`). */
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Un champ : son libellé, son aide, et l'erreur qui le concerne. */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error: string | null;
  children: ReactNode;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {hint !== undefined && <span className="form-hint"> {hint}</span>}
      </label>
      {children}
      <span className="form-error" id={`${id}-error`} aria-live="polite">
        {error ?? ""}
      </span>
    </div>
  );
}

/** Les propriétés communes d'un formulaire en boîte de dialogue. */
interface IDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * La boîte : `showModal()` à l'ouverture, `close()` à la fermeture — l'état
 * React commande, le navigateur gère le focus. Envoyer désactive le bouton
 * le temps de la réponse : pas de double envoi.
 */
function FormDialog({
  open,
  onClose,
  title,
  lead,
  submitLabel,
  submit,
  danger = false,
  children,
}: IDialogProps & {
  title: string;
  lead: string;
  submitLabel: string;
  /** Un geste sans retour : le bouton le dit par sa couleur ET son libellé. */
  danger?: boolean;
  /** Rend `null` en cas de succès, ou le motif d'un refus. */
  submit: () => Promise<string | null>;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  const send = () => {
    if (busy) return;
    setBusy(true);
    submit()
      .then((refused) => {
        if (refused === null) onClose();
      })
      .catch(() => {
        // `submit` rend le motif d'un refus ; il ne rejette pas.
      })
      .finally(() => setBusy(false));
  };
  return (
    <dialog
      ref={ref}
      className="room-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <header>
          <h3 id={titleId}>{title}</h3>
          <p>{lead}</p>
        </header>
        {children}
        <div className="form-actions">
          <button type="button" className="room-btn" onClick={onClose}>
            Annuler
          </button>
          <button
            type="submit"
            className={danger ? "room-btn is-danger" : "room-btn is-primary"}
            disabled={busy}
            aria-busy={busy}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}

/** Créer un salon : nom, accès, description. */
export function CreateRoomDialog({
  open,
  onClose,
  forms,
}: IDialogProps & { forms: IRoomForms }) {
  const id = useId();
  const [name, setName] = useState("");
  const [access, setAccess] = useState<"public" | "private">("public");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setName("");
    setAccess("public");
    setDescription("");
    setError(null);
  }, [open]);
  const submit = async (): Promise<string | null> => {
    const problem = roomNameProblem(normalizeRoomName(name));
    if (problem !== null) {
      setError(problem);
      return problem;
    }
    try {
      await forms.createRoom({
        name,
        access,
        ...(description.trim() === "" ? {} : { description }),
      });
      return null;
    } catch (refusal) {
      const message = messageOf(refusal);
      setError(message);
      return message;
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Nouveau salon"
      lead={`Tu en seras propriétaire. Tu peux en posséder ${ROOMS_OWNED_MAX}.`}
      submitLabel="Créer"
      submit={submit}
    >
      <Field id={`${id}-name`} label="Nom" error={error}>
        <input
          id={`${id}-name`}
          value={name}
          maxLength={ROOM_NAME_MAX}
          autoComplete="off"
          aria-invalid={error !== null}
          aria-describedby={`${id}-name-error`}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
        />
      </Field>
      <fieldset className="form-field">
        <legend>Accès</legend>
        <label>
          <input
            type="radio"
            name={`${id}-access`}
            checked={access === "public"}
            onChange={() => setAccess("public")}
          />{" "}
          Public · lecture libre
        </label>
        <label>
          <input
            type="radio"
            name={`${id}-access`}
            checked={access === "private"}
            onChange={() => setAccess("private")}
          />{" "}
          Privé · sur invitation
        </label>
      </fieldset>
      <Field
        id={`${id}-description`}
        label="Description"
        hint={`(facultative, ${ROOM_DESCRIPTION_MAX} caractères au plus)`}
        error={null}
      >
        <textarea
          id={`${id}-description`}
          rows={2}
          maxLength={ROOM_DESCRIPTION_MAX}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
    </FormDialog>
  );
}

/**
 * Supprimer le salon ouvert : on TAPE son nom pour confirmer — un geste sans
 * retour ne se valide pas par réflexe (le patron d'une forge pour un dépôt).
 * Le serveur rejoue la règle (`roomDeletionProblem`) : propriétaire seul.
 */
export function DeleteRoomDialog({
  open,
  onClose,
  forms,
  roomName,
}: IDialogProps & { forms: IRoomForms; roomName: string }) {
  const id = useId();
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setTyped("");
    setError(null);
  }, [open]);
  const submit = async (): Promise<string | null> => {
    if (typed.trim() !== roomName) {
      const problem = `tapez « ${roomName} » pour confirmer`;
      setError(problem);
      return problem;
    }
    try {
      await forms.deleteRoom();
      return null;
    } catch (refusal) {
      const message = messageOf(refusal);
      setError(message);
      return message;
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`Supprimer « ${roomName} »`}
      lead="Messages, pièces jointes, membres et événements seront effacés pour tout le monde. C'est définitif."
      submitLabel="Supprimer définitivement"
      danger
      submit={submit}
    >
      <Field
        id={`${id}-confirm`}
        label={`Tapez « ${roomName} » pour confirmer`}
        error={error}
      >
        <input
          id={`${id}-confirm`}
          value={typed}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby={`${id}-confirm-error`}
          onChange={(event) => {
            setTyped(event.target.value);
            setError(null);
          }}
        />
      </Field>
    </FormDialog>
  );
}

/**
 * Exclure un membre du salon ouvert (XEP-0045 §9.4) : ses onglets quittent le
 * salon aussitôt, sur tous les serveurs. Le serveur relit les rôles en base
 * (`memberRemovalProblem`) : seul le propriétaire retire un modérateur.
 */
export function RemoveMemberDialog({
  open,
  onClose,
  forms,
  roomName,
  member,
}: IDialogProps & {
  forms: IRoomForms;
  roomName: string;
  /** La personne à exclure ; `null` quand la boîte est fermée. */
  member: { id: string; name: string } | null;
}) {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) setError(null);
  }, [open]);
  const submit = async (): Promise<string | null> => {
    if (member === null) return "aucun membre choisi";
    try {
      await forms.removeMember(member.id);
      return null;
    } catch (refusal) {
      const message = messageOf(refusal);
      setError(message);
      return message;
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`Exclure ${member?.name ?? ""} de « ${roomName} »`}
      lead="Ses onglets ouverts quittent le salon aussitôt. Pour y revenir, il lui faudra une nouvelle invitation."
      submitLabel="Exclure du salon"
      danger
      submit={submit}
    >
      {error !== null && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </FormDialog>
  );
}

/**
 * Quitter le salon ouvert : un salon privé ne se rouvre que sur une nouvelle
 * invitation, la boîte le dit avant. Le serveur rejoue la règle
 * (`memberRemovalProblem`) : le propriétaire ne quitte pas, il supprime.
 */
export function LeaveRoomDialog({
  open,
  onClose,
  forms,
  roomName,
  restricted,
}: IDialogProps & {
  forms: IRoomForms;
  roomName: string;
  /** Salon privé ou verrouillé : y revenir exige une invitation. */
  restricted: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) setError(null);
  }, [open]);
  const submit = async (): Promise<string | null> => {
    try {
      await forms.leaveRoom();
      return null;
    } catch (refusal) {
      const message = messageOf(refusal);
      setError(message);
      return message;
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`Quitter « ${roomName} »`}
      lead={
        restricted
          ? "Vous ne recevrez plus ses messages. Pour y revenir, il faudra qu'on vous réinvite."
          : "Vous ne serez plus membre de ce salon ; il reste ouvert à tous, vous pourrez y revenir en visiteur."
      }
      submitLabel="Quitter le salon"
      danger
      submit={submit}
    >
      {error !== null && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </FormDialog>
  );
}

/** Inviter dans le salon ouvert, par identifiant exact. */
export function InviteDialog({
  open,
  onClose,
  forms,
  roomName,
  myRole,
}: IDialogProps & {
  forms: IRoomForms;
  roomName: string;
  myRole: RoomRole | null;
}) {
  const id = useId();
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<"member" | "moderator">("member");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setIdentifier("");
    setRole("member");
    setError(null);
  }, [open]);
  const owner = myRole === "owner";
  const submit = async (): Promise<string | null> => {
    if (identifier.trim() === "") {
      const message = "Saisis l'identifiant exact du compte.";
      setError(message);
      return message;
    }
    try {
      await forms.invite({ identifier, role });
      return null;
    } catch (refusal) {
      const message = messageOf(refusal);
      setError(message);
      return message;
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`Inviter dans ${roomName}`}
      lead="L'identifiant exact du compte : la démo ne liste pas les comptes."
      submitLabel="Inviter"
      submit={submit}
    >
      <Field id={`${id}-who`} label="Identifiant" error={error}>
        <input
          id={`${id}-who`}
          value={identifier}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby={`${id}-who-error`}
          onChange={(event) => {
            setIdentifier(event.target.value);
            setError(null);
          }}
        />
      </Field>
      <fieldset className="form-field">
        <legend>Rôle</legend>
        <label>
          <input
            type="radio"
            name={`${id}-role`}
            checked={role === "member"}
            onChange={() => setRole("member")}
          />{" "}
          Membre
        </label>
        <label>
          <input
            type="radio"
            name={`${id}-role`}
            checked={role === "moderator"}
            disabled={!owner}
            onChange={() => setRole("moderator")}
          />{" "}
          Modérateur
        </label>
        {!owner && (
          <span className="form-hint">
            Seul le propriétaire nomme un modérateur.
          </span>
        )}
      </fieldset>
    </FormDialog>
  );
}

/** Planifier un événement dans le salon ouvert. */
export function EventDialog({
  open,
  onClose,
  forms,
  roomName,
}: IDialogProps & { forms: IRoomForms; roomName: string }) {
  const id = useId();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guest, setGuest] = useState("");
  const [guests, setGuests] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    title: string | null;
    slot: string | null;
    guests: string | null;
  }>({ title: null, slot: null, guests: null });
  useEffect(() => {
    if (!open) return;
    // La prochaine heure pleine, pour une heure.
    const next = Math.ceil(Date.now() / 3_600_000) * 3_600_000;
    setTitle("");
    setStart(toLocalInput(next));
    setEnd(toLocalInput(next + 3_600_000));
    setGuest("");
    setGuests([]);
    setErrors({ title: null, slot: null, guests: null });
  }, [open]);
  const addGuest = () => {
    const wanted = guest.trim();
    if (guests.length >= EVENT_ATTENDEES_MAX && wanted !== "") {
      setErrors((was) => ({
        ...was,
        guests: `${EVENT_ATTENDEES_MAX} invités au plus.`,
      }));
      return;
    }
    if (wanted !== "" && !guests.includes(wanted))
      setGuests([...guests, wanted]);
    setGuest("");
  };
  const onGuestKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    // Entrée ajoute l'invité au lieu d'envoyer le formulaire.
    event.preventDefault();
    addGuest();
  };
  const submit = async (): Promise<string | null> => {
    const from = fromLocalInput(start);
    const to = fromLocalInput(end);
    const found = {
      title: title.trim() === "" ? "Donne un titre." : null,
      slot:
        Number.isNaN(from) || Number.isNaN(to)
          ? "Début et fin sont requis."
          : eventProblem(from, to, Date.now()),
      guests: null,
    };
    if (found.title !== null || found.slot !== null) {
      setErrors(found);
      return found.title ?? found.slot;
    }
    try {
      await forms.planEvent({
        title,
        start: from,
        end: to,
        timeZone: TIME_ZONE,
        attendees: guests,
      });
      return null;
    } catch (refusal) {
      // Un compte inconnu est la seule cause que la page ne peut pas voir.
      const message = messageOf(refusal);
      setErrors({ title: null, slot: null, guests: message });
      return message;
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`Planifier dans ${roomName}`}
      lead="Les invités entrent dans le salon 15 minutes avant le début, jusqu'à la fin."
      submitLabel="Planifier"
      submit={submit}
    >
      <Field id={`${id}-title`} label="Titre" error={errors.title}>
        <input
          id={`${id}-title`}
          value={title}
          maxLength={EVENT_TITLE_MAX}
          aria-invalid={errors.title !== null}
          aria-describedby={`${id}-title-error`}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <div className="form-row">
        <Field id={`${id}-start`} label="Début" error={null}>
          <input
            id={`${id}-start`}
            type="datetime-local"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </Field>
        <Field id={`${id}-end`} label="Fin" error={errors.slot}>
          <input
            id={`${id}-end`}
            type="datetime-local"
            value={end}
            aria-invalid={errors.slot !== null}
            aria-describedby={`${id}-end-error`}
            onChange={(event) => setEnd(event.target.value)}
          />
        </Field>
      </div>
      <p className="form-hint">Fuseau : {TIME_ZONE}, gardé avec l'événement.</p>
      <Field
        id={`${id}-guest`}
        label="Inviter"
        hint="(identifiant exact, Entrée pour ajouter)"
        error={errors.guests}
      >
        <input
          id={`${id}-guest`}
          value={guest}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={errors.guests !== null}
          aria-describedby={`${id}-guest-error`}
          onChange={(event) => setGuest(event.target.value)}
          onKeyDown={onGuestKey}
          onBlur={addGuest}
        />
      </Field>
      {guests.length > 0 && (
        <ul className="form-chips" aria-label="Invités">
          {guests.map((name) => (
            <li key={name}>
              {name}
              <button
                type="button"
                aria-label={`Retirer ${name}`}
                onClick={() => setGuests(guests.filter((g) => g !== name))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </FormDialog>
  );
}
