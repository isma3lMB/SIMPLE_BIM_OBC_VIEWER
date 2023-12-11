import React from 'react'
import * as OBC from "openbim-components"
import * as THREE from "three"

export default () => {
  const [modelCount, setModelCount] = React.useState(0)

  React.useEffect(() =>  {
    const viewer = new OBC.Components()
    // OBC.
    const sceneComponent = new OBC.SimpleScene(viewer)
    sceneComponent.setup()
    viewer.scene = sceneComponent

    const viewerContainer = document.getElementById("viewerContainer") as HTMLDivElement
    
   

    const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
    viewer.renderer = rendererComponent
    const postproduction = rendererComponent.postproduction

    const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
    viewer.camera = cameraComponent

    const raycasterComponent = new OBC.SimpleRaycaster(viewer)
    viewer.raycaster = raycasterComponent


    const dimensions = new OBC.LengthMeasurement(viewer);
    dimensions.enabled = false;
    dimensions.snapDistance = 1;
    viewerContainer.ondblclick = () => dimensions.create();

    
    viewer.init()
    cameraComponent.updateAspect()
    postproduction.enabled = true

    // const grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x666666))
    // postproduction.customEffects.excludedMeshes.push(grid.get())
    

    const cubeMap = new OBC.CubeMap(viewer)
    cubeMap.setPosition('top-right')
    // const exploder = new OBC.FragmentExploder(viewer)
    // exploder.enabled = true
    // exploder.uiElement.get('main').domElement.onclick = async () => await exploder.explode()

    const clipper = new OBC.SimpleClipper(viewer)
    clipper.enabled = true
    viewerContainer.ondblclick = () => clipper.create();

    const fragmentManager = new OBC.FragmentManager(viewer)
    const ifcLoader = new OBC.FragmentIfcLoader(viewer)

    const highlighter = new OBC.FragmentHighlighter(viewer)
    highlighter.setup()

     /// new button 
    const myButton = document.getElementById("myButton") as HTMLButtonElement

    myButton.onclick = () => {
      
      const selectedIds : string [] = []
      // selectedIds.pu
      // console.log(Object.values(highlighter.selection.select))
      Object.values(highlighter.selection.select).map(selectedSet => selectedIds.push(...selectedSet))

      // console.log(highlighter.selection.select)
      console.log(new Set(selectedIds))
      console.log(viewer)
    }

    const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
    highlighter.events.select.onClear.add(() => {
      propertiesProcessor.cleanPropertiesList()
    })

    ifcLoader.onIfcLoaded.add(model => {
      setModelCount(fragmentManager.groups.length)
      propertiesProcessor.process(model)
      highlighter.events.select.onHighlight.add((selection) => {
        const fragmentID = Object.keys(selection)[0]
        const expressID = Number([...selection[fragmentID]][0])
        propertiesProcessor.renderProperties(model, expressID)
      })
      highlighter.update()
    })

    const mainToolbar = new OBC.Toolbar(viewer)
    mainToolbar.addChild(
      ifcLoader.uiElement.get("main"),
      propertiesProcessor.uiElement.get("main"),
      dimensions.uiElement.get("main"),
      clipper.uiElement.get("main")
    )
    viewer.ui.addToolbar(mainToolbar)
  }, [])

  const viewerContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    gridArea: "viewer"
  }

  const titleStyle: React.CSSProperties = {
    position: "absolute",
    top: "15px",
    left: "15px"
  }

  const myButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "15px",
    left: "50%"
  }

  return (
    <>
      <div id="viewerContainer" style={viewerContainerStyle}>
        <h3 style={titleStyle}>Models loaded: {modelCount}</h3>
        <button style={myButtonStyle} id ="myButton">LOG IDS</button>
      </div>
    </>
  )
}
