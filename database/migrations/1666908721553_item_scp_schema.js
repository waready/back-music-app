'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ItemScpSchema extends Schema {
  up () {
    this.create('item_scps', (table) => {
      table.increments()
      table.string('name')
      table.string('item',100)
      table.text('descrition')
      table.string('avatar')

      table.integer('category_id').unsigned();
      table.foreign('category_id').references('categories.id');

      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id');

      table.string("ip_creator",120).nullable();
      table.timestamps()
    })
  }

  down () {
    this.drop('item_scps')
  }
}

module.exports = ItemScpSchema
