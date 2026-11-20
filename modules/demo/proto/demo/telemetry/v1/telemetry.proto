// Le contrat gRPC de la démo « Machines en gRPC » : ce que pousse une machine.
//
// Guide pour un agent : la source UNIQUE du service — le code TypeScript en
// est GÉNÉRÉ dans `nodefony/gen/` (ne jamais l'éditer), servi par
// `nodefony/controllers/TelemetryController.ts` et appelé par
// `nodefony/command/SensorPushCommand.ts`. Changer un message = changer ce
// fichier puis régénérer. Skill : `nodefony-add-grpc-service`.

edition = "2024";

package demo.telemetry.v1;

import "google/protobuf/timestamp.proto";

// #region proto-service

// Une machine pousse ses mesures ; la page les suit par la socket de la démo.
service TelemetryService {
  // Flux client : la machine envoie tant qu'elle mesure, une seule réponse à la fin.
  rpc Push(stream PushRequest) returns (PushResponse);
  // Unaire, sans effet de bord : servi aussi en GET, qu'un cache et curl savent lire.
  rpc Latest(LatestRequest) returns (LatestResponse) {
    option idempotency_level = NO_SIDE_EFFECTS;
  }
}

// #endregion

// #region proto-reading

// Une mesure, datée par la machine qui l'a prise.
message Reading {
  string machine = 1;
  double celsius = 2;
  google.protobuf.Timestamp measured_at = 3;
}

// #endregion

message PushRequest {
  Reading reading = 1;
}

message PushResponse {
  // Mesures retenues par le serveur, sur toute la durée du flux.
  uint32 accepted = 1;
}

message LatestRequest {
  string machine = 1;
}

message LatestResponse {
  // Absente tant que la machine n'a rien envoyé.
  Reading reading = 1;
}
