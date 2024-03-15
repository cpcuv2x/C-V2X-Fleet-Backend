import './App.css'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OBU_table from './components/obu_table'
import RSU_table from './components/rsu_table'
import Reporter from './components/reporter'

function App() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center">C-V2X Data Simulator</h1>
      <Tabs defaultValue="obu" className="w-full">
        <TabsList>
          <TabsTrigger value="obu">OBU</TabsTrigger>
          <TabsTrigger value="rsu">RSU</TabsTrigger>
          <TabsTrigger value="reporter">Reporter</TabsTrigger>
        </TabsList>
        <TabsContent value="obu" className='w-full'>
          <OBU_table />
        </TabsContent>
        <TabsContent value="rsu">
          <RSU_table />
        </TabsContent>
        <TabsContent value="reporter">
          <Reporter />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default App
