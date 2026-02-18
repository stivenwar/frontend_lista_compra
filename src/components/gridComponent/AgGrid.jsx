import { useEffect, useState } from "react";
import "./AgGrid.css";


const GridExample = () => {



    const [proveedores, setProveedores] = useState([]);
    const [nuevoProveedor, setNuevoProveedor] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingProveedor, setLoadingProveedor] = useState(false);
    const [loadingProducto, setLoadingProducto] = useState(null);
    const [proveedorAbierto, setProveedorAbierto] = useState(null);




    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/proveedores");
            const data = await response.json();
            setProveedores(data);
            console.log("PROVEEDORES:", data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loader">
                <div className="spinner"></div>
            </div>
        );
    }


    const addProveedor = async () => {
        console.log("proveedores", proveedores);
        console.log("nuevoProveedor", nuevoProveedor);
        if (!nuevoProveedor.trim()) return;

        try {
            setLoadingProveedor(true);
            const response = await fetch("http://localhost:3000/proveedores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: nuevoProveedor
                })
            });

            if (!response.ok) {
                throw new Error("Error al crear proveedor");
            }

            const data = await response.json();

            console.log("PROVEEDOR CREADO:", data);

            setProveedores(prev => [...prev, data]);
            setNuevoProveedor("");


            //await fetchProveedores();

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingProveedor(false);
        }
    };


    const addProducto = async (proveedorId, nombre) => {
        console.log("proveedorId", proveedorId);
        console.log("nombre", nombre);
        if (!nombre.trim()) return;

        try {
            setLoadingProducto(true);
            const response = await fetch(
                `http://localhost:3000/proveedores/${proveedorId}/productos`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: nombre,
                    })
                }
            );



            const data = await response.json();
            console.log("PRODUCTO CREADO:", data);

            // Actualizamos estado local

            //await fetchProveedores();
            setProveedores(prev => {
                return prev.map(prov => {
                    if (prov.id === proveedorId) {
                        return {
                            ...prov,
                            productos: [...prov.productos, data]
                        };
                    }
                    return prov;
                });
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingProducto(false);
        }
    };
    const eliminarProducto = async (proveedorId, productoId) => {
        try {
            setLoadingProducto(true);
            await fetch(
                `http://localhost:3000/proveedores/${proveedorId}/productos/${productoId}`,
                {
                    method: "DELETE"
                }
            );

            //await fetchProveedores(); // 🔥 refresca todo desde Firebase
            setProveedores(prev => {
                return prev.map(prov => {
                    if (prov.id === proveedorId) {
                        return {
                            ...prov,
                            productos: prov.productos.filter(prod => prod.id !== productoId)
                        };
                    }
                    return prov;
                });
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingProducto(false);
        }
    };


    return (
        <div className="container">

            {/* Header */}
            <div className="header">
                <div>Proveedor</div>
                <div>Producto</div>
            </div>

            {/* Filas */}
            {proveedores.map(prov => (
                <div key={prov.id}>

                    <div
                        className="proveedorRow proveedorClickable"
                        onClick={() =>
                            setProveedorAbierto(
                                proveedorAbierto === prov.id ? null : prov.id
                            )
                        }
                    >
                        <span className="proveedorNombre">
                            {prov.name}
                        </span>

                        <span
                            className={`arrow ${proveedorAbierto === prov.id ? "open" : ""
                                }`}
                        >
                            ▶
                        </span>
                    </div>

                    {/* Productos */}
                    {proveedorAbierto === prov.id && (
                        <div className="productos">
                            {prov.productos?.map(prod => (
                                <div key={prod.id} className="productoRow">
                                    <div>{prod.name}</div>
                                    <div>
                                        <button
                                            className="btnDelete"
                                            onClick={(e) => {
                                                e.stopPropagation(); // 🔥 importante
                                                eliminarProducto(prov.id, prod.id);
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {loadingProducto === prov.id ? (
                                <div className="spinner"></div>
                            ) : (
                                <AddProductRow
                                    onAdd={(nombre) => addProducto(prov.id, nombre)}
                                />
                            )}
                        </div>
                    )}


                </div>
            ))}

            <hr />

            {/* Crear proveedor */}

            <div className="rowInput">
                {loadingProveedor ? (
                    <div className="spinner"></div>
                ) : (
                    <>
                        <input
                            className="input"
                            type="text"
                            placeholder="Nuevo proveedor"
                            value={nuevoProveedor}
                            onChange={(e) => setNuevoProveedor(e.target.value)}
                        />

                        <button
                            className="btnAdd"
                            onClick={addProveedor}
                        >
                            Agregar proveedor
                        </button>
                    </>
                )}
            </div>

        </div>
    );
};



const AddProductRow = ({ onAdd }) => {
    const [nombre, setNombre] = useState("");

    return (
        <div className="rowInput">
            <input
                className="input"
                type="text"
                placeholder="Nuevo producto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <button
                className="btnAdd"
                onClick={() => {
                    onAdd(nombre);
                    setNombre("");
                }}
            >
                Agregar
            </button>
        </div>
    );
};

export default GridExample;
