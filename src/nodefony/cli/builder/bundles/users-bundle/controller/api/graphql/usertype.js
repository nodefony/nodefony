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

  # the schema allows the following query:
  type Query {
    user(username: String!): User
    users: [User]
  }

  # this schema allows the following mutation:
  type Mutation {
    addUser(username: String!, email: String!, password: String!): User
  }
`

module.exports = type
