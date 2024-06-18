'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const Helpers = use('Helpers');
const ItemScp = use('App/Models/ItemScp');
/**
 * Resourceful controller for interacting with itemscps
 */
class ItemScpController {
  /**
   * Show a list of all itemscps.
   * GET itemscps
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
   async index ({ request, response }) {
    const spcs = await ItemScp.all()
    return response.json(spcs)
  }

  /**
   * Render a form to be used for creating a new itemscp.
   * GET itemscps/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new itemscp.
   * POST itemscps
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async store ({ auth,request, response }) {
    const user = await auth.getUser();
    const scp = request.all();
    const newSpcs = new ItemScp();
    const avatar = request.file('avatar',{
        types:['image'],
        size:'2mb'
    })
    
    newSpcs.name        = scp.name
    newSpcs.item        = scp.item
    newSpcs.descrition = scp.descrition 
    newSpcs.category_id = scp.category_id
    newSpcs.user_id     = user.id
    newSpcs.avatar = new Date().getTime()+"."+avatar.subtype;
    await avatar.move(Helpers.publicPath('uploads'),{
      name: newSpcs.avatar
    })
    if(!avatar.moved()){
      return "ocurrio un error";
    }
    await newSpcs.save()
     
    
    return response.json(newSpcs)
  }
  /**
   * Display a single itemscp.
   * GET itemscps/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing itemscp.
   * GET itemscps/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update itemscp details.
   * PUT or PATCH itemscps/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async update ({ auth,params, request, response }) {
    const user = await auth.getUser();
    const scp = request.all();
    const {id} = params;
    const UdpSpcs = await ItemScp.find(id)
    const avatar = request.file('avatar',{
      types:['image'],
      size:'2mb'
    })
    
    UdpSpcs.name        = scp.name
    UdpSpcs.item        = scp.item
    UdpSpcs.descrition  = scp.descrition 
    UdpSpcs.category_id = scp.category_id
    UdpSpcs.user_id     = user.id
    UdpSpcs.avatar = new Date().getTime()+"."+avatar.subtype;
    await avatar.move(Helpers.publicPath('uploads'),{
      name: UdpSpcs.avatar
    })
    if(!avatar.moved()){
      return "ocurrio un error";
    }

    await UdpSpcs.save()

    return response.json(UdpSpcs)
  }

  /**
   * Delete a itemscp with id.
   * DELETE itemscps/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async destroy ({ params, response }) {
    const {id} = params;
    const DeleteSpcs = await ItemScp.find(id);
    await DeleteSpcs.delete();
    return response.json(DeleteSpcs);
  }
}

module.exports = ItemScpController
