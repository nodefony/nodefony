module.exports = {
  //  provides all functions for each API endpoint

  async getMigrations(field, context) {
    const umzug = context.get("umzug")
    let errors = []
    try {
      const executed = await umzug.executed(null, false)
        .catch((e) => {
          context.log(e, 'ERROR')
          errors.push(e)
        })
      const pending = await umzug.pending(null, false)
        .catch((e) => {
          context.log(e, 'ERROR')
          errors.push(e)
        })
      return JSON.stringify({
        executed,
        pending,
        errors
      })
    } catch (e) {
      return JSON.stringify({
        errors
      })
    }
  },

  //mutations
  async upMigrate(field, context) {
    const umzug = context.get("umzug")
    let errors = []
    try {
      const res = await umzug.migrate(field.connector, {
          migrations: [field.name]
        })
        .catch((e) => {
          context.log(e, 'ERROR')
          errors.push(e)
        })
      return JSON.stringify(res)
    } catch (e) {
      return JSON.stringify({
        errors: e
      })
    }
  },

  async downMigrate(field, context) {
    const umzug = context.get("umzug")
    let errors = []
    try {
      const res = await umzug.down(field.connector, {
          migrations: [field.name]
        })
        .catch((e) => {
          context.log(e, 'ERROR')
          errors.push(e)
        })
      return JSON.stringify(res)
    } catch (e) {
      return JSON.stringify({
        errors: e
      })
    }
  },

  async allMigrate(field, context){
    const {connector} =field
    const umzug = context.get("umzug")
    let errors = []
    try {
      const res = await umzug.up(connector)
        .catch((e) => {
          context.log(e, 'ERROR')
          errors.push(e)
        })
      return JSON.stringify(res)
    } catch (e) {
      return JSON.stringify({
        errors: e
      })
    }
  },

  async allRevert(field, context){
    const {connector} =field
    const umzug = context.get("umzug")
    let errors = []
    try {
      const res = await umzug.revertAll(connector)
        .catch((e) => {
          context.log(e, 'ERROR')
          errors.push(e)
        })
      return JSON.stringify(res)
    } catch (e) {
      return JSON.stringify({
        errors: e
      })
    }
  }
};
