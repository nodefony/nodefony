
const Sequelize =require("sequelize");

module.exports = nodefony.registerEntity("devices", function(){

    const devices = function(db, ormService){

        const model = db.define("devices", {
                id          :    {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
                hostname    :    {type:Sequelize.STRING },
                ip          :    {type:Sequelize.STRING },
                telnet      :    {type: Sequelize.TEXT }
        });


        ormService.listen(this, 'onReadyConnection', function(connectionName, db, ormService){
            if(connectionName === 'console'){
                let devicetype = ormService.getEntity("deviceType");
                if ( devicetype){
                    model.belongsTo(devicetype, {  foreignKey: 'type'  ,constraints: false});
                }else{
                    throw "ENTITY ASSOCIATION deviceType NOT AVAILABLE";
                }
            }
        });


        return model ;
    };

    return {
        type:"sequelize",
        connection : "console",
        entity:devices

    };
});