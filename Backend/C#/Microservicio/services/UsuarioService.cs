using Models;

namespace Service;

public class UsuarioService : IUsuarioService
{
    private readonly List<Usuario> _usuarios;
    private int _nextId;

    public UsuarioService()
    {
        _usuarios = new List<Usuario>();
        _nextId = 1;
        InicializarDatos();
    }

    private void InicializarDatos()
    {
        var usuariosIniciales = new[]
        {
            new Usuario
            {
                Id = GetNextId(),
                Nombre = "Juan Pérez",
                Email = "juan@example.com",
                Telefono = "+57 300 123 4567",
                Rol = "admin",
                FechaRegistro = DateTime.Now,
                Activo = true
            },
            new Usuario
            {
                Id = GetNextId(),
                Nombre = "María García",
                Email = "maria@example.com",
                Telefono = "+57 301 234 5678",
                Rol = "usuario",
                FechaRegistro = DateTime.Now,
                Activo = true
            }
        };

        _usuarios.AddRange(usuariosIniciales);
    }

    private int GetNextId() => _nextId++;

    public async Task<IEnumerable<Usuario>> GetUsuariosAsync()
    {
        return await Task.FromResult(_usuarios);
    }

    public async Task<Usuario?> GetUsuarioByIdAsync(int id)
    {
        var usuario = _usuarios.FirstOrDefault(u => u.Id == id);
        return await Task.FromResult(usuario);
    }

    public async Task<Usuario> CreateUsuarioAsync(UsuarioCreateDto usuarioDto)
    {
        var usuario = new Usuario
        {
            Id = GetNextId(),
            Nombre = usuarioDto.Nombre,
            Email = usuarioDto.Email,
            Telefono = usuarioDto.Telefono,
            Rol = usuarioDto.Rol,
            FechaRegistro = DateTime.Now,
            Activo = true
        };

        _usuarios.Add(usuario);
        return await Task.FromResult(usuario);
    }

    public async Task<Usuario?> UpdateUsuarioAsync(int id, UsuarioUpdateDto usuarioDto)
    {
        var usuario = _usuarios.FirstOrDefault(u => u.Id == id);
        if (usuario == null) return null;

        if (!string.IsNullOrEmpty(usuarioDto.Nombre))
            usuario.Nombre = usuarioDto.Nombre;
        if (!string.IsNullOrEmpty(usuarioDto.Email))
            usuario.Email = usuarioDto.Email;
        if (!string.IsNullOrEmpty(usuarioDto.Telefono))
            usuario.Telefono = usuarioDto.Telefono;
        if (!string.IsNullOrEmpty(usuarioDto.Rol))
            usuario.Rol = usuarioDto.Rol;
        if (usuarioDto.Activo.HasValue)
            usuario.Activo = usuarioDto.Activo.Value;

        return await Task.FromResult(usuario);
    }

    public async Task<bool> DeleteUsuarioAsync(int id)
    {
        var usuario = _usuarios.FirstOrDefault(u => u.Id == id);
        if (usuario == null) return false;

        _usuarios.Remove(usuario);
        return await Task.FromResult(true);
    }

    public async Task<IEnumerable<Usuario>> GetUsuariosByRolAsync(string rol)
    {
        var usuarios = _usuarios.Where(u => u.Rol.Equals(rol, StringComparison.OrdinalIgnoreCase));
        return await Task.FromResult(usuarios);
    }

    public Task<Usuario> GetUsuariosByIdAsync(int id)
    {
        throw new NotImplementedException();
    }
}