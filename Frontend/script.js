        // Configuración de URLs de los microservicios
        const API_URLS = {
            python: 'http://localhost:8001',
            csharp: 'http://localhost:5002/api',
            php: 'http://localhost:8003/api/pedidos'
        };

        // Funciones de utilidad
        function showMessage(containerId, message, type = 'info') {
            const container = document.getElementById(containerId);
            const className = type === 'error' ? 'error' : type === 'success' ? 'success' : 'loading';
            container.innerHTML = `<div class="${className}">${message}</div>`;
        }

        function updateServiceStatus(service, isOnline) {
            const statusElement = document.getElementById(`${service}-status`);
            if (isOnline) {
                statusElement.className = 'status-indicator status-online';
                statusElement.textContent = '🟢 Conectado';
            } else {
                statusElement.className = 'status-indicator status-offline';
                statusElement.textContent = '🔴 Desconectado';
            }
        }

        // Funciones para modales
        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        // Cerrar modal al hacer clic fuera
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        }

        // Health checks
        async function checkHealth(service) {
            const urls = {
                python: `${API_URLS.python}/health`,
                csharp: `${API_URLS.csharp}/usuarios/health`,
                php: `${API_URLS.php}/health`
            };

            try {
                const response = await fetch(urls[service]);
                const data = await response.json();
                updateServiceStatus(service, true);
                alert(`✅ ${service.toUpperCase()}: ${data.status || 'healthy'}`);
            } catch (error) {
                updateServiceStatus(service, false);
                alert(`❌ ${service.toUpperCase()}: No disponible`);
            }
        }

        // Funciones para Productos (Python FastAPI)
        async function loadProductos() {
            showMessage('productos-container', 'Cargando productos...', 'info');
            
            try {
                const response = await fetch(`${API_URLS.python}/productos`);
                if (!response.ok) throw new Error('Error al cargar productos');
                
                const productos = await response.json();
                updateServiceStatus('python', true);
                
                if (productos.length === 0) {
                    showMessage('productos-container', 'No hay productos disponibles', 'info');
                    return;
                }

                let html = '';
                productos.forEach(producto => {
                    html += `
                        <div class="item">
                            <h4>${producto.nombre}</h4>
                            <p><strong>Precio:</strong> ${producto.precio}</p>
                            <p><strong>Categoría:</strong> ${producto.categoria}</p>
                            <p><strong>Stock:</strong> ${producto.stock}</p>
                            <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                            <div class="item-actions">
                                <button class="btn btn-warning btn-small" onclick="deleteProducto(${producto.id})">🗑️ Eliminar</button>
                            </div>
                        </div>
                    `;
                });
                
                document.getElementById('productos-container').innerHTML = html;
            } catch (error) {
                updateServiceStatus('python', false);
                showMessage('productos-container', `Error: ${error.message}`, 'error');
            }
        }

        async function createProducto(event) {
            event.preventDefault();
            
            const producto = {
                nombre: document.getElementById('producto-nombre').value,
                descripcion: document.getElementById('producto-descripcion').value,
                precio: parseFloat(document.getElementById('producto-precio').value),
                categoria: document.getElementById('producto-categoria').value,
                stock: parseInt(document.getElementById('producto-stock').value)
            };

            try {
                const response = await fetch(`${API_URLS.python}/productos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(producto)
                });

                if (!response.ok) throw new Error('Error al crear producto');
                
                closeModal('producto-modal');
                document.getElementById('producto-form').reset();
                alert('✅ Producto creado exitosamente');
                loadProductos();
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }

        async function deleteProducto(id) {
            if (!confirm('¿Estás seguro de eliminar este producto?')) return;

            try {
                const response = await fetch(`${API_URLS.python}/productos/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Error al eliminar producto');
                
                alert('✅ Producto eliminado exitosamente');
                loadProductos();
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }

        // Funciones para Usuarios (C# ASP.NET)
        async function loadUsuarios() {
            showMessage('usuarios-container', 'Cargando usuarios...', 'info');
            
            try {
                const response = await fetch(`${API_URLS.csharp}/usuarios`);
                if (!response.ok) throw new Error('Error al cargar usuarios');
                
                const usuarios = await response.json();
                updateServiceStatus('csharp', true);
                
                if (usuarios.length === 0) {
                    showMessage('usuarios-container', 'No hay usuarios disponibles', 'info');
                    return;
                }

                let html = '';
                usuarios.forEach(usuario => {
                    html += `
                        <div class="item">
                            <h4>${usuario.nombre}</h4>
                            <p><strong>Email:</strong> ${usuario.email}</p>
                            <p><strong>Teléfono:</strong> ${usuario.telefono}</p>
                            <p><strong>Rol:</strong> ${usuario.rol}</p>
                            <p><strong>Estado:</strong> ${usuario.activo ? 'Activo' : 'Inactivo'}</p>
                            <div class="item-actions">
                                <button class="btn btn-warning btn-small" onclick="deleteUsuario(${usuario.id})">🗑️ Eliminar</button>
                            </div>
                        </div>
                    `;
                });
                
                document.getElementById('usuarios-container').innerHTML = html;
            } catch (error) {
                updateServiceStatus('csharp', false);
                showMessage('usuarios-container', `Error: ${error.message}`, 'error');
            }
        }

        async function createUsuario(event) {
            event.preventDefault();
            
            const usuario = {
                nombre: document.getElementById('usuario-nombre').value,
                email: document.getElementById('usuario-email').value,
                telefono: document.getElementById('usuario-telefono').value,
                rol: document.getElementById('usuario-rol').value
            };

            try {
                const response = await fetch(`${API_URLS.csharp}/usuarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuario)
                });

                if (!response.ok) throw new Error('Error al crear usuario');
                
                closeModal('usuario-modal');
                document.getElementById('usuario-form').reset();
                alert('✅ Usuario creado exitosamente');
                loadUsuarios();
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }

        async function deleteUsuario(id) {
            if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

            try {
                const response = await fetch(`${API_URLS.csharp}/usuarios/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Error al eliminar usuario');
                
                alert('✅ Usuario eliminado exitosamente');
                loadUsuarios();
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }

        // Funciones para Pedidos (PHP)
        async function loadPedidos() {
            showMessage('pedidos-container', 'Cargando pedidos...', 'info');
            
            try {
                const response = await fetch(`${API_URLS.php}`);
                if (!response.ok) throw new Error('Error al cargar pedidos');
                
                const pedidos = await response.json();
                updateServiceStatus('php', true);
                
                if (pedidos.length === 0) {
                    showMessage('pedidos-container', 'No hay pedidos disponibles', 'info');
                    return;
                }

                let html = '';
                pedidos.forEach(pedido => {
                    html += `
                        <div class="item">
                            <h4>Pedido #${pedido.id}</h4>
                            <p><strong>Cliente ID:</strong> ${pedido.cliente_id}</p>
                            <p><strong>Total:</strong> ${pedido.total}</p>
                            <p><strong>Estado:</strong> ${pedido.estado}</p>
                            <p><strong>Fecha:</strong> ${pedido.fecha_pedido}</p>
                            <p><strong>Dirección:</strong> ${pedido.direccion_entrega}</p>
                            <div class="item-actions">
                                <button class="btn btn-warning btn-small" onclick="deletePedido(${pedido.id})">🗑️ Eliminar</button>
                            </div>
                        </div>
                    `;
                });
                
                document.getElementById('pedidos-container').innerHTML = html;
            } catch (error) {
                updateServiceStatus('php', false);
                showMessage('pedidos-container', `Error: ${error.message}`, 'error');
            }
        }

        async function createPedido(event) {
            event.preventDefault();
            
            const pedido = {
                cliente_id: parseInt(document.getElementById('pedido-cliente').value),
                productos: [{
                    producto_id: parseInt(document.getElementById('pedido-producto-id').value),
                    cantidad: parseInt(document.getElementById('pedido-cantidad').value),
                    precio_unitario: parseFloat(document.getElementById('pedido-precio').value)
                }],
                direccion_entrega: document.getElementById('pedido-direccion').value
            };

            try {
                const response = await fetch(`${API_URLS.php}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pedido)
                });

                if (!response.ok) throw new Error('Error al crear pedido');
                
                closeModal('pedido-modal');
                document.getElementById('pedido-form').reset();
                alert('✅ Pedido creado exitosamente');
                loadPedidos();
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }

        async function deletePedido(id) {
            if (!confirm('¿Estás seguro de eliminar este pedido?')) return;

            try {
                const response = await fetch(`${API_URLS.php}/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Error al eliminar pedido');
                
                alert('✅ Pedido eliminado exitosamente');
                loadPedidos();
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }

        // Event listeners para formularios
        document.getElementById('producto-form').addEventListener('submit', createProducto);
        document.getElementById('usuario-form').addEventListener('submit', createUsuario);
        document.getElementById('pedido-form').addEventListener('submit', createPedido);

        // Inicialización: verificar estado de servicios al cargar
        document.addEventListener('DOMContentLoaded', () => {
            checkHealth('python');
            checkHealth('csharp');
            checkHealth('php');
        });