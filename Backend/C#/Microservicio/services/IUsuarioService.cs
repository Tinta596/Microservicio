using Models;

namespace Service;

public interface IUsuarioService
{
    Task<IEnumerable<Usuario>> GetUsuariosAsync();
    Task<Usuario> GetUsuariosByIdAsync(int id);
    Task<Usuario> CreateUsuarioAsync(UsuarioCreateDto usuarioDto);
    Task<Usuario> UpdateUsuarioAsync(int id, UsuarioUpdateDto usuarioDto);
    Task<bool> DeleteUsuarioAsync(int id);
    Task<IEnumerable<Usuario>> GetUsuariosByRolAsync(string rol);
}