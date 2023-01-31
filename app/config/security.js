/**
 *  Firewall Config  service Security
 */
module.exports = {

  security: {

    /**
     *  FIREWALL strategy
     *  when change security context (usefull with multi firewalls areas)
     *
     *  Strategy can be : none, migrate, invalidate
     */
    session_fixation_strategy: "migrate",

    /**
     *  FIREWALL  Authorization
     */
    access_control: [{
      path: /^\/nodefony/,
      roles: ["ROLE_MONITORING"],
      requires_channel: "https"

      /* allow_if: {
        roles: ["ROLE_ADMIN"]
      }*/
    }],

    /**
     * FIREWALL  AREAS
     */
    firewalls: {
      app_area: {
        pattern: /^\/app/
      }
    }
  }
};
