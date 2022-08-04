const type = `

  scalar Date
  scalar Url
  scalar Array

  type User {
    username: String!
    surname: String
    name: String
    enabled: Boolean
    userNonExpired: Boolean
    credentialsNonExpired : Boolean
    accountNonLocked: Boolean
    email : String!
    lang : String
    gender: String
    url : Url
    createdAt: Date
    updatedAt: Date
    image: String
    roles : Array
  }
`

module.exports = type
