using System.ComponentModel.DataAnnotations;

namespace Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
    public bool Activo { get; set; }
}

public class UsuarioCreateDto
{
    [Required]
    public string Nombre { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public string Telefono { get; set; } = string.Empty;
    
    [Required]
    public string Rol { get; set; } = string.Empty;
}

public class UsuarioUpdateDto
{
    public string? Nombre { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Rol { get; set; }
    public bool? Activo { get; set; }
}