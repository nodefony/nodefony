/*
 *
 *
 *    ENTITY USER
 *
 *
 */
try {
    var Sequelize =require("sequelize");
} catch (err) {
  console.log('sequelize  is disabled! ' + err);
}

module.exports = nodefony.registerEntity("client", function(){

    var Client = function(db, ormService){
        var model = db.define("client", {
                id             : {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
                name         : {type: Sequelize.STRING(126).BINARY, unique: true, allowNull: false},
                clientId    : {type: Sequelize.STRING , allowNull: false },
                clientSecret: {type: Sequelize.STRING , allowNull: false },
                isTrusted    : {type: Sequelize.STRING , allowNull: false }

            },{
            classMethods: {
            }
        });

        /*ormService.listen(this, 'onReadyConnection', function(connectionName, db, ormService){
            if(connectionName === 'nodefony'){

            }
        });*/
        return model ;
    };

    return {
        type:"sequelize",
        connection : "nodefony",
        entity:Client
    };
});
