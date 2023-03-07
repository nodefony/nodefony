import KcAdminClient from '@keycloak/keycloak-admin-client';


import "../css/keycloak.css"

console.log("passsss")


/*
 *	Class Bundle App
 */
class Keycloak  {
  constructor() {
    this.kcAdminClient = new KcAdminClient({
      realmName:"nodefony",
      baseUrl:"http://localhost:8080"
    });
    console.log(this.kcAdminClient)
    this.auth()
    .catch(e=>{
      console.log(e)
    })
  }


  async auth(){
    return await this.kcAdminClient.auth({
      username: 'cci',
      password: '91984869',
      grantType: 'password',
      clientId: 'admin-cli',
      //totp: '123456', // optional Time-based One-time Password if OTP is required in authentication flow
      });
  }

  async userList(){
    // List all users
    const users = await this.kcAdminClient.users.find();
    return users
  }

  async groupList(){
     // This operation will now be performed in 'another-realm' if the user has access.
    const groups = await this.kcAdminClient.groups.find();
    return groups 
  }


  async creteUser(){

  }
 


}

const keycloak = new Keycloak();
