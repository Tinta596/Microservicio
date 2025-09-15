using Microsoft.AspNetCore.Mvc;
using Models;
using Service;

namespace Controllers;

[ApiController]
[Route("api/usuarios")]
public class UsuarioController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    public UsuarioController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
    {
        var usuarios = await _usuarioService.GetUsuariosAsync();
        return Ok(usuarios);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Usuario>> GetUsuario(int id)
    {
        var usuario = await _usuarioService.GetUsuariosByIdAsync(id);
        if (usuario == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }
        return Ok(usuario);
    }

    [HttpPost]
    public async Task<ActionResult<Usuario>> CreateUsuario(UsuarioCreateDto usuarioDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var usuario = await _usuarioService.CreateUsuarioAsync(usuarioDto);
        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuario);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Usuario>> UpdateUsuario(int id, UsuarioUpdateDto usuarioDto)
    {
        var usuario = await _usuarioService.UpdateUsuarioAsync(id, usuarioDto);
        if (usuario == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }
        return Ok(usuario);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUsuario(int id)
    {
        var eliminado = await _usuarioService.DeleteUsuarioAsync(id);
        if (!eliminado)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        return Ok(new { message = "Usuario eliminado exitosamente" });
    }

    [HttpGet("rol/{rol}")]
    public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuariosByRol(string rol)
    {
        var usuarios = await _usuarioService.GetUsuariosByRolAsync(rol);
        return Ok(usuarios);
    }

    [HttpGet("health")]
    public ActionResult GetHealth()
    {
        return Ok(new { status = "healthy", service = "usuarios-api" });
    }
}