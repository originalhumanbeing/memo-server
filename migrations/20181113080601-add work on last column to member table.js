'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Member', 'lastwork', {
        type: Sequelize.INTEGER,
        allowNull: true
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
