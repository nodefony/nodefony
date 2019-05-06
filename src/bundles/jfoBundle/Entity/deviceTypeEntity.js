const Sequelize =require("sequelize");

module.exports = nodefony.registerEntity("deviceType", function(){

    const deviceType = function(db/*, ormService*/){

        const model = db.define("deviceType", {
                id          :    {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
                name        :    {type:Sequelize.STRING },
                svg         :    {type:Sequelize.TEXT },
                console     :    {type: Sequelize.BOOLEAN, defaultValue:false},
                svgConsole  :    {type:Sequelize.TEXT ,defaultValue:""},
                logo        :    {type:Sequelize.STRING }            
        });

        return model ;
    };

    return {
        type:"sequelize",
        connection : "console",
        entity:deviceType

    };
});