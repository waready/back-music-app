'use strict'

/*
|--------------------------------------------------------------------------
| DatabaseSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Category = use('App/Models/Category');

class DatabaseSeeder {
  async run () {
    await Category
      .createMany([
        {
          name:"Seguro",
          danger:"one"
        },
        {
          name:"Euclid",
          danger:"one"
        },
        {
          name:"Keter",
          danger:"one"
        },
        {
          name:"Neutralizado",
          danger:'two'
        },
        {
          name:"Explicado",
          danger:'two'
        },
        {
          name:"Thaumiel",
          danger:'three'
        },
        {
          name:"Apollyon",
          danger:'three'
        },
        {
          name:"Desmantelado",
          danger:'three'
        }
      ]);
  }
}

module.exports = DatabaseSeeder
