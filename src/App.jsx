import { useState } from 'react'
import GridExample from './components/gridComponent/AgGrid'

function App() {
  const [count, setCount] = useState(0)


  return (
    <>
      <h1 style={{ textAlign: "center" }}>Lista de la compra</h1>
      <GridExample />
    </>
  )
}

export default App
