module.exports = {
  monitoring: {
   class: nodefony.services.monitoring,
   arguments: ["@realTime", "@container", "@kernel"]
 },
  Monitor: {
    class: nodefony.services.Monitor,
    arguments: ["@container", "@kernel"]
  }
};
