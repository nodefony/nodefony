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
     * FIREWALL  AREAS
     */
    firewalls: {
      app_area:{
        pattern: /^\/app/
      }
    }
  }
};
