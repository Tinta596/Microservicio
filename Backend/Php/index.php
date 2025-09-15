<?php
// index.php - Microservicio de Pedidos en PHP puro

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Configuración
$base_path = '/api/pedidos';
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Router básico
$path = str_replace($base_path, '', parse_url($request_uri, PHP_URL_PATH));
$path_segments = explode('/', trim($path, '/'));

// Base de datos en memoria (simulada con archivos)
class PedidosDatabase {
    private $data_file = 'pedidos_data.json';
    private $next_id_file = 'next_id.txt';

    public function __construct() {
        if (!file_exists($this->data_file)) {
            $this->initializeData();
        }
    }

    private function initializeData() {
        $initial_data = [
            [
                'id' => 1,
                'cliente_id' => 1,
                'productos' => [
                    ['producto_id' => 1, 'cantidad' => 2, 'precio_unitario' => 1500.99],
                    ['producto_id' => 2, 'cantidad' => 1, 'precio_unitario' => 45.50]
                ],
                'total' => 3047.48,
                'estado' => 'pendiente',
                'fecha_pedido' => date('Y-m-d H:i:s'),
                'direccion_entrega' => 'Calle 123 #45-67, Bogotá'
            ],
            [
                'id' => 2,
                'cliente_id' => 2,
                'productos' => [
                    ['producto_id' => 2, 'cantidad' => 3, 'precio_unitario' => 45.50]
                ],
                'total' => 136.50,
                'estado' => 'entregado',
                'fecha_pedido' => date('Y-m-d H:i:s', strtotime('-1 day')),
                'direccion_entrega' => 'Carrera 456 #78-90, Medellín'
            ]
        ];
        
        file_put_contents($this->data_file, json_encode($initial_data, JSON_PRETTY_PRINT));
        file_put_contents($this->next_id_file, '3');
    }

    public function getAll() {
        $data = file_get_contents($this->data_file);
        return json_decode($data, true) ?? [];
    }

    public function getById($id) {
        $pedidos = $this->getAll();
        foreach ($pedidos as $pedido) {
            if ($pedido['id'] == $id) {
                return $pedido;
            }
        }
        return null;
    }

    public function create($data) {
        $pedidos = $this->getAll();
        $next_id = (int)file_get_contents($this->next_id_file);
        
        $nuevo_pedido = [
            'id' => $next_id,
            'cliente_id' => $data['cliente_id'],
            'productos' => $data['productos'],
            'total' => $this->calculateTotal($data['productos']),
            'estado' => 'pendiente',
            'fecha_pedido' => date('Y-m-d H:i:s'),
            'direccion_entrega' => $data['direccion_entrega']
        ];

        $pedidos[] = $nuevo_pedido;
        file_put_contents($this->data_file, json_encode($pedidos, JSON_PRETTY_PRINT));
        file_put_contents($this->next_id_file, (string)($next_id + 1));

        return $nuevo_pedido;
    }

    public function update($id, $data) {
        $pedidos = $this->getAll();
        foreach ($pedidos as &$pedido) {
            if ($pedido['id'] == $id) {
                if (isset($data['estado'])) $pedido['estado'] = $data['estado'];
                if (isset($data['direccion_entrega'])) $pedido['direccion_entrega'] = $data['direccion_entrega'];
                if (isset($data['productos'])) {
                    $pedido['productos'] = $data['productos'];
                    $pedido['total'] = $this->calculateTotal($data['productos']);
                }
                
                file_put_contents($this->data_file, json_encode($pedidos, JSON_PRETTY_PRINT));
                return $pedido;
            }
        }
        return null;
    }

    public function delete($id) {
        $pedidos = $this->getAll();
        $initial_count = count($pedidos);
        $pedidos = array_filter($pedidos, function($p) use ($id) {
            return $p['id'] != $id;
        });
        
        if (count($pedidos) < $initial_count) {
            file_put_contents($this->data_file, json_encode(array_values($pedidos), JSON_PRETTY_PRINT));
            return true;
        }
        return false;
    }

    public function getByEstado($estado) {
        $pedidos = $this->getAll();
        return array_filter($pedidos, function($p) use ($estado) {
            return strtolower($p['estado']) === strtolower($estado);
        });
    }

    public function getByCliente($cliente_id) {
        $pedidos = $this->getAll();
        return array_filter($pedidos, function($p) use ($cliente_id) {
            return $p['cliente_id'] == $cliente_id;
        });
    }

    private function calculateTotal($productos) {
        $total = 0;
        foreach ($productos as $producto) {
            $total += $producto['cantidad'] * $producto['precio_unitario'];
        }
        return $total;
    }
}

// Controlador de Pedidos
class PedidosController {
    private $db;

    public function __construct() {
        $this->db = new PedidosDatabase();
    }

    public function handleRequest($method, $path_segments) {
        switch ($method) {
            case 'GET':
                return $this->handleGet($path_segments);
            case 'POST':
                return $this->handlePost($path_segments);
            case 'PUT':
                return $this->handlePut($path_segments);
            case 'DELETE':
                return $this->handleDelete($path_segments);
            default:
                return $this->jsonResponse(['error' => 'Método no permitido'], 405);
        }
    }

    private function handleGet($path_segments) {
        if (empty($path_segments[0])) {
            // GET /pedidos
            return $this->jsonResponse($this->db->getAll());
        }

        if ($path_segments[0] === 'health') {
            return $this->jsonResponse(['status' => 'healthy', 'service' => 'pedidos-api']);
        }

        if ($path_segments[0] === 'estado' && isset($path_segments[1])) {
            // GET /pedidos/estado/{estado}
            $pedidos = $this->db->getByEstado($path_segments[1]);
            return $this->jsonResponse(array_values($pedidos));
        }

        if ($path_segments[0] === 'cliente' && isset($path_segments[1])) {
            // GET /pedidos/cliente/{cliente_id}
            $pedidos = $this->db->getByCliente((int)$path_segments[1]);
            return $this->jsonResponse(array_values($pedidos));
        }

        if (is_numeric($path_segments[0])) {
            // GET /pedidos/{id}
            $pedido = $this->db->getById((int)$path_segments[0]);
            if ($pedido) {
                return $this->jsonResponse($pedido);
            } else {
                return $this->jsonResponse(['error' => 'Pedido no encontrado'], 404);
            }
        }

        return $this->jsonResponse(['error' => 'Ruta no encontrada'], 404);
    }

    private function handlePost($path_segments) {
        if (empty($path_segments[0])) {
            // POST /pedidos
            $input = $this->getJsonInput();
            
            // Validaciones básicas
            if (!isset($input['cliente_id']) || !isset($input['productos']) || !isset($input['direccion_entrega'])) {
                return $this->jsonResponse(['error' => 'Datos requeridos: cliente_id, productos, direccion_entrega'], 400);
            }

            if (!is_array($input['productos']) || empty($input['productos'])) {
                return $this->jsonResponse(['error' => 'Productos debe ser un array no vacío'], 400);
            }

            $pedido = $this->db->create($input);
            return $this->jsonResponse($pedido, 201);
        }

        return $this->jsonResponse(['error' => 'Ruta no encontrada'], 404);
    }

    private function handlePut($path_segments) {
        if (is_numeric($path_segments[0])) {
            // PUT /pedidos/{id}
            $input = $this->getJsonInput();
            $pedido = $this->db->update((int)$path_segments[0], $input);
            
            if ($pedido) {
                return $this->jsonResponse($pedido);
            } else {
                return $this->jsonResponse(['error' => 'Pedido no encontrado'], 404);
            }
        }

        return $this->jsonResponse(['error' => 'Ruta no encontrada'], 404);
    }

    private function handleDelete($path_segments) {
        if (is_numeric($path_segments[0])) {
            // DELETE /pedidos/{id}
            $deleted = $this->db->delete((int)$path_segments[0]);
            
            if ($deleted) {
                return $this->jsonResponse(['message' => 'Pedido eliminado exitosamente']);
            } else {
                return $this->jsonResponse(['error' => 'Pedido no encontrado'], 404);
            }
        }

        return $this->jsonResponse(['error' => 'Ruta no encontrada'], 404);
    }

    private function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Inicialización
try {
    $controller = new PedidosController();
    $controller->handleRequest($request_method, $path_segments);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}