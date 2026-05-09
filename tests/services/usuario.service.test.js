const usuarioRepository = require('../../src/repositories/usuario.repository');
const usuarioService = require('../../src/services/usuario.service');
const { generarHashContrasena } = require('../../src/utils/password');

describe('Pruebas unitarias - usuario.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('crearUsuario', () => {
    it('debe crear un usuario correctamente', async () => {
      const data = {
        tipo_documento: 'CC',
        numero_documento: '123456789',
        nombre: 'Jaider Rios',
        correo: 'jaider@mail.com',
        telefono: '3001234567'
      };

      vi.spyOn(usuarioRepository, 'buscarPorNumeroDocumento').mockResolvedValue(null);
      vi.spyOn(usuarioRepository, 'buscarPorCorreo').mockResolvedValue(null);
      vi.spyOn(usuarioRepository, 'crearUsuario').mockResolvedValue({
        id: 1,
        ...data,
        estado: true
      });
      vi.spyOn(usuarioRepository, 'crearSaldoInicial').mockResolvedValue();

      const resultado = await usuarioService.crearUsuario(data);

      expect(usuarioRepository.buscarPorNumeroDocumento).toHaveBeenCalledWith('123456789');
      expect(usuarioRepository.buscarPorCorreo).toHaveBeenCalledWith('jaider@mail.com');
      expect(usuarioRepository.crearUsuario).toHaveBeenCalled();
      expect(usuarioRepository.crearSaldoInicial).toHaveBeenCalledWith(1);
      expect(resultado.nombre).toBe('Jaider Rios');
    });

    it('debe lanzar error si faltan campos obligatorios', async () => {
      const data = {
        tipo_documento: 'CC',
        numero_documento: '',
        nombre: ''
      };

      await expect(usuarioService.crearUsuario(data)).rejects.toThrow(
        'Los campos tipo_documento, numero_documento y nombre son obligatorios'
      );
    });

    it('debe lanzar error si ya existe un usuario con ese documento', async () => {
      const data = {
        tipo_documento: 'CC',
        numero_documento: '123456789',
        nombre: 'Jaider Rios'
      };

      vi.spyOn(usuarioRepository, 'buscarPorNumeroDocumento').mockResolvedValue({
        id: 1,
        numero_documento: '123456789'
      });

      await expect(usuarioService.crearUsuario(data)).rejects.toThrow(
        'Ya existe un usuario con ese número de documento'
      );
    });

    it('debe lanzar error si ya existe un usuario con ese correo', async () => {
      const data = {
        tipo_documento: 'CC',
        numero_documento: '987654321',
        nombre: 'Jaider Rios',
        correo: 'jaider@mail.com'
      };

      vi.spyOn(usuarioRepository, 'buscarPorNumeroDocumento').mockResolvedValue(null);
      vi.spyOn(usuarioRepository, 'buscarPorCorreo').mockResolvedValue({
        id: 1,
        correo: 'jaider@mail.com'
      });

      await expect(usuarioService.crearUsuario(data)).rejects.toThrow(
        'Ya existe un usuario con ese correo'
      );
    });
  });

  describe('registrarUsuario', () => {
    it('debe registrar un usuario con contrasena hasheada', async () => {
      const data = {
        tipo_documento: 'CC',
        numero_documento: '10101010',
        nombre: 'Usuario Registro',
        correo: 'registro@mail.com',
        telefono: '3001234567',
        contrasena: 'secreta123'
      };

      vi.spyOn(usuarioRepository, 'buscarPorNumeroDocumento').mockResolvedValue(null);
      vi.spyOn(usuarioRepository, 'buscarPorCorreo').mockResolvedValue(null);
      vi.spyOn(usuarioRepository, 'crearUsuario').mockResolvedValue({
        id: 10,
        tipo_documento: data.tipo_documento,
        numero_documento: data.numero_documento,
        nombre: data.nombre,
        correo: data.correo,
        telefono: data.telefono,
        estado: true
      });
      vi.spyOn(usuarioRepository, 'crearSaldoInicial').mockResolvedValue();

      const resultado = await usuarioService.registrarUsuario(data);

      expect(usuarioRepository.buscarPorNumeroDocumento).toHaveBeenCalledWith('10101010');
      expect(usuarioRepository.buscarPorCorreo).toHaveBeenCalledWith('registro@mail.com');
      expect(usuarioRepository.crearUsuario).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo_documento: data.tipo_documento,
          numero_documento: data.numero_documento,
          nombre: data.nombre,
          correo: data.correo,
          telefono: data.telefono,
          contrasena_hash: expect.stringMatching(/^pbkdf2_sha256\$/)
        })
      );
      expect(usuarioRepository.crearSaldoInicial).toHaveBeenCalledWith(10);
      expect(resultado).not.toHaveProperty('contrasena_hash');
      expect(resultado.correo).toBe(data.correo);
    });

    it('debe lanzar error si faltan campos obligatorios para registro', async () => {
      await expect(usuarioService.registrarUsuario({ correo: 'registro@mail.com' })).rejects.toThrow(
        'Los campos tipo_documento, numero_documento, nombre, correo y contrasena son obligatorios'
      );
    });

    it('debe lanzar error si la contrasena es muy corta', async () => {
      const data = {
        tipo_documento: 'CC',
        numero_documento: '10101011',
        nombre: 'Usuario Registro',
        correo: 'registro2@mail.com',
        contrasena: '123'
      };

      await expect(usuarioService.registrarUsuario(data)).rejects.toThrow(
        'La contrasena debe tener al menos 6 caracteres'
      );
    });

    it('debe lanzar error si el documento ya esta registrado', async () => {
      const data = {
        tipo_documento: 'CC',
        numero_documento: '10101012',
        nombre: 'Usuario Registro',
        correo: 'registro3@mail.com',
        contrasena: 'secreta123'
      };

      vi.spyOn(usuarioRepository, 'buscarPorNumeroDocumento').mockResolvedValue({
        id: 10,
        numero_documento: data.numero_documento
      });

      await expect(usuarioService.registrarUsuario(data)).rejects.toThrow(
        'Ya existe un usuario con ese numero de documento'
      );
    });

    it('debe lanzar error si el correo ya esta registrado', async () => {
      const data = {
        tipo_documento: 'CC',
        numero_documento: '10101013',
        nombre: 'Usuario Registro',
        correo: 'registro4@mail.com',
        contrasena: 'secreta123'
      };

      vi.spyOn(usuarioRepository, 'buscarPorNumeroDocumento').mockResolvedValue(null);
      vi.spyOn(usuarioRepository, 'buscarPorCorreo').mockResolvedValue({
        id: 11,
        correo: data.correo
      });

      await expect(usuarioService.registrarUsuario(data)).rejects.toThrow(
        'Ya existe un usuario con ese correo'
      );
    });
  });

  describe('iniciarSesion', () => {
    it('debe iniciar sesion con correo y contrasena validos', async () => {
      vi.spyOn(usuarioRepository, 'buscarPorCorreo').mockResolvedValue({
        id: 10,
        nombre: 'Usuario Login',
        correo: 'login@mail.com',
        estado: true,
        contrasena_hash: generarHashContrasena('secreta123')
      });

      const resultado = await usuarioService.iniciarSesion({
        correo: 'login@mail.com',
        contrasena: 'secreta123'
      });

      expect(usuarioRepository.buscarPorCorreo).toHaveBeenCalledWith('login@mail.com');
      expect(resultado.usuario.correo).toBe('login@mail.com');
      expect(resultado.usuario).not.toHaveProperty('contrasena_hash');
      expect(resultado.token).toEqual(expect.any(String));
    });

    it('debe iniciar sesion con numero_documento y contrasena validos', async () => {
      vi.spyOn(usuarioRepository, 'buscarPorNumeroDocumento').mockResolvedValue({
        id: 11,
        nombre: 'Usuario Login Documento',
        numero_documento: '555555',
        estado: true,
        contrasena_hash: generarHashContrasena('secreta123')
      });

      const resultado = await usuarioService.iniciarSesion({
        numero_documento: '555555',
        contrasena: 'secreta123'
      });

      expect(usuarioRepository.buscarPorNumeroDocumento).toHaveBeenCalledWith('555555');
      expect(resultado.usuario.numero_documento).toBe('555555');
      expect(resultado.token).toHaveLength(64);
    });

    it('debe lanzar error si faltan credenciales', async () => {
      await expect(usuarioService.iniciarSesion({ correo: 'login@mail.com' })).rejects.toThrow(
        'El correo o numero_documento y la contrasena son obligatorios'
      );
    });

    it('debe lanzar error si las credenciales son invalidas', async () => {
      vi.spyOn(usuarioRepository, 'buscarPorCorreo').mockResolvedValue({
        id: 12,
        correo: 'login@mail.com',
        estado: true,
        contrasena_hash: generarHashContrasena('secreta123')
      });

      await expect(
        usuarioService.iniciarSesion({
          correo: 'login@mail.com',
          contrasena: 'incorrecta'
        })
      ).rejects.toThrow('Credenciales invalidas');
    });

    it('debe lanzar error si el usuario esta inactivo', async () => {
      vi.spyOn(usuarioRepository, 'buscarPorCorreo').mockResolvedValue({
        id: 13,
        correo: 'inactivo@mail.com',
        estado: false,
        contrasena_hash: generarHashContrasena('secreta123')
      });

      await expect(
        usuarioService.iniciarSesion({
          correo: 'inactivo@mail.com',
          contrasena: 'secreta123'
        })
      ).rejects.toThrow('Usuario inactivo');
    });
  });

  describe('listarUsuarios', () => {
    it('debe retornar la lista de usuarios', async () => {
      const usuariosMock = [
        { id: 1, nombre: 'Jaider Rios' },
        { id: 2, nombre: 'Ana Torres' }
      ];

      vi.spyOn(usuarioRepository, 'listarUsuarios').mockResolvedValue(usuariosMock);

      const resultado = await usuarioService.listarUsuarios();

      expect(usuarioRepository.listarUsuarios).toHaveBeenCalled();
      expect(resultado).toHaveLength(2);
    });
  });

  describe('obtenerUsuarioPorId', () => {
    it('debe retornar un usuario si existe', async () => {
      const usuarioMock = { id: 1, nombre: 'Jaider Rios' };

      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue(usuarioMock);

      const resultado = await usuarioService.obtenerUsuarioPorId(1);

      expect(usuarioRepository.obtenerUsuarioPorId).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(usuarioMock);
    });

    it('debe lanzar error si el id no es válido', async () => {
      await expect(usuarioService.obtenerUsuarioPorId('abc')).rejects.toThrow(
        'El id del usuario no es válido'
      );
    });

    it('debe lanzar error si el usuario no existe', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue(null);

      await expect(usuarioService.obtenerUsuarioPorId(99)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('cambiarEstadoUsuario', () => {
    it('debe cambiar el estado correctamente', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        nombre: 'Jaider Rios',
        estado: true
      });

      vi.spyOn(usuarioRepository, 'actualizarEstadoUsuario').mockResolvedValue({
        id: 1,
        nombre: 'Jaider Rios',
        estado: false
      });

      const resultado = await usuarioService.cambiarEstadoUsuario(1, false);

      expect(usuarioRepository.obtenerUsuarioPorId).toHaveBeenCalledWith(1);
      expect(usuarioRepository.actualizarEstadoUsuario).toHaveBeenCalledWith(1, false);
      expect(resultado.estado).toBe(false);
    });

    it('debe lanzar error si estado no es boolean', async () => {
      await expect(usuarioService.cambiarEstadoUsuario(1, 'false')).rejects.toThrow(
        'El campo estado debe ser true o false'
      );
    });

    it('debe lanzar error si el usuario no existe', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue(null);

      await expect(usuarioService.cambiarEstadoUsuario(100, false)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('obtenerSaldoUsuario', () => {
    it('debe retornar el saldo del usuario', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        nombre: 'Jaider Rios'
      });

      vi.spyOn(usuarioRepository, 'obtenerSaldoUsuario').mockResolvedValue({
        usuario_id: 1,
        saldo_actual: 50
      });

      const resultado = await usuarioService.obtenerSaldoUsuario(1);

      expect(usuarioRepository.obtenerUsuarioPorId).toHaveBeenCalledWith(1);
      expect(usuarioRepository.obtenerSaldoUsuario).toHaveBeenCalledWith(1);
      expect(resultado.saldo_actual).toBe(50);
    });

    it('debe lanzar error si no existe el usuario', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue(null);

      await expect(usuarioService.obtenerSaldoUsuario(5)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });

    it('debe lanzar error si no existe saldo', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        nombre: 'Jaider Rios'
      });

      vi.spyOn(usuarioRepository, 'obtenerSaldoUsuario').mockResolvedValue(null);

      await expect(usuarioService.obtenerSaldoUsuario(1)).rejects.toThrow(
        'Saldo no encontrado'
      );
    });
  });
});
