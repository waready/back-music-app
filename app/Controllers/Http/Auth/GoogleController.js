'use strict'

const User = use('App/Models/User')
const Env = use('Env')

class GoogleController {
  async redirectToProvider({ ally }) {
    console.log(ally.driver('google'))
    await ally.driver('google').redirect()
  }

  async handleCallback({ ally, auth, response }) {
    console.log("llego")
    try {
        const googleUser = await ally.driver('google').getUser()
    
        // Verificar si el usuario ya está registrado en la base de datos
        let user = await User.findBy('email', googleUser.getEmail())
    
        // Si el usuario no está registrado, crear un nuevo registro
        if (!user) {
          user = new User()
          user.username = googleUser.getEmail() // Utilizamos el correo electrónico como nombre de usuario
          user.email = googleUser.getEmail()
    
          // Generar una contraseña aleatoria y almacenarla en la base de datos
          const randomPassword = Math.random().toString(36).slice(-8) // Genera una cadena aleatoria de 8 caracteres
          user.password = randomPassword
    
          // Guardar el nuevo usuario en la base de datos
          await user.save()
        }
    
        // Autenticar al usuario
        let token = await auth.generate(user)
    
        // Agregar el token generado al objeto de usuario
        Object.assign(user, token)
    
        return response.json(user)
      } catch (error) {
        console.error(error)
        return response.status(500).json({ message: 'Error en el servidor.' })
      }
  }
}

module.exports = GoogleController