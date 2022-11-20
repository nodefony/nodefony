module.exports = {
  Query: {
    async getMigrations(obj, field, context, info) {
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
    }
  },

  //mutations
  Mutation: {
    async upMigrate(obj, field, context, info) {
      const umzug = context.get("umzug")
      let errors = []
      try {
        const res = await umzug.up(field.connector, {
            step: 1,
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

    async downMigrate(obj, field, context, info) {
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

    async allMigrate(obj, field, context, info) {
      const {
        connector
      } = field
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

    async allRevert(obj, field, context, info) {
      const {
        connector
      } = field
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
  }

};
