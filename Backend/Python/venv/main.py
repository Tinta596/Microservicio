from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import json

app = FastAPI(title="Productos API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class ProductoBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    stock: int

class Producto(ProductoBase):
    id: int
    fecha_creacion: datetime

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    categoria: Optional[str] = None
    stock: Optional[int] = None

# Base de datos en memoria (simulada)
productos_db = []
next_id = 1

# Funciones auxiliares
def get_next_id():
    global next_id
    current = next_id
    next_id += 1
    return current

def find_producto_by_id(producto_id: int):
    return next((p for p in productos_db if p["id"] == producto_id), None)

# Endpoints
@app.get("/")
async def root():
    return {"message": "Microservicio de Productos - FastAPI", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "productos-api"}

@app.get("/productos", response_model=List[Producto])
async def get_productos():
    return productos_db

@app.get("/productos/{producto_id}", response_model=Producto)
async def get_producto(producto_id: int):
    producto = find_producto_by_id(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@app.post("/productos", response_model=Producto, status_code=201)
async def create_producto(producto: ProductoCreate):
    nuevo_producto = {
        "id": get_next_id(),
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "precio": producto.precio,
        "categoria": producto.categoria,
        "stock": producto.stock,
        "fecha_creacion": datetime.now()
    }
    productos_db.append(nuevo_producto)
    return nuevo_producto

@app.put("/productos/{producto_id}", response_model=Producto)
async def update_producto(producto_id: int, producto_update: ProductoUpdate):
    producto = find_producto_by_id(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Actualizar solo los campos proporcionados
    update_data = producto_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        producto[field] = value
    
    return producto

@app.delete("/productos/{producto_id}")
async def delete_producto(producto_id: int):
    global productos_db
    producto = find_producto_by_id(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    productos_db = [p for p in productos_db if p["id"] != producto_id]
    return {"message": "Producto eliminado exitosamente"}

@app.get("/productos/categoria/{categoria}")
async def get_productos_por_categoria(categoria: str):
    productos_categoria = [p for p in productos_db if p["categoria"].lower() == categoria.lower()]
    return productos_categoria

# Inicializar algunos datos de prueba
@app.on_event("startup")
async def startup_event():
    global productos_db
    productos_iniciales = [
        {
            "id": get_next_id(),
            "nombre": "Laptop Gamer",
            "descripcion": "Laptop para gaming de alta gama",
            "precio": 1500.99,
            "categoria": "tecnologia",
            "stock": 10,
            "fecha_creacion": datetime.now()
        },
        {
            "id": get_next_id(),
            "nombre": "Mouse Inalámbrico",
            "descripcion": "Mouse ergonómico inalámbrico",
            "precio": 45.50,
            "categoria": "tecnologia",
            "stock": 25,
            "fecha_creacion": datetime.now()
        }
    ]
    productos_db.extend(productos_iniciales)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)