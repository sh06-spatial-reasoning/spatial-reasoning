import type { HighlightKind } from './Store.tsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { useShallow } from 'zustand/react/shallow'
import { CodedPlan } from './drawing/auxiliary/CodedPlan.tsx'
import { CuboidStructureInputs } from './drawing/control/CuboidStructureInputs.tsx'
import { DownloadDefinitionButton } from './io/DownloadDefinitionButton.tsx'
import { DrawingsDialog } from './dialog/DrawingsDialog.tsx'
import { DrawingProvider } from './drawing/DrawingStore.tsx'
import { ExportButton } from './io/ExportButton.tsx'
import { ExportContainer } from './io/ExportContainer.tsx'
import { ExportDialog } from './dialog/ExportDialog.tsx'
import { IsometricControls } from './drawing/control/IsometricControls.tsx'
import { IsometricViewport } from './drawing/isometric/IsometricViewport.tsx'
import { IsometricViewport3D } from './drawing/3d/IsometricViewport3D.tsx'
import { OrthographicControls } from './drawing/control/OrthographicControls.tsx'
import { OrthographicEditorDialog } from './dialog/OrthographicEditorDialog.tsx'
import { OrthographicViews } from './drawing/auxiliary/OrthographicViews.tsx'
import { ResetConfirmDialog } from './dialog/ResetConfirmDialog.tsx'
import { RotationButtons } from './drawing/control/RotationButtons.tsx'
import { StoreDrawingControls } from './drawing/StoreDrawingControls.tsx'
import { defaultDrawingDefinition, useStore } from './Store.tsx'

function App() {
  const downloadAnchor = document.getElementById('download-anchor') as HTMLAnchorElement

  const codedPlanParentRef = useRef<HTMLDivElement|null>(null)
  const orthographicParentRef = useRef<HTMLDivElement|null>(null)

  const [
    setSupportsHover,
    newDefinition
  ] = useStore(useShallow((state) => [
    state.setSupportsHover,
    state.newDefinition
  ]))

  const [highlightKind, setHighlightKind] = useState<HighlightKind>('face')
  /** Whether the isometric drawing card has swapped with the 3D object card. */
  const [isDrawingFocused, setIsDrawingFocused] = useState(false)

  const keyDownCallback = useCallback((event: KeyboardEvent) => {
    if (event.repeat || (event.key !== 'd' && event.code !== 'Delete')) return
    setHighlightKind('cuboid')
  }, [setHighlightKind])
  const keyUpCallback = useCallback((event: KeyboardEvent) => {
    if (event.repeat || (event.key !== 'd' && event.code !== 'Delete')) return
    setHighlightKind('face')
  }, [setHighlightKind])

  useEffect(() => {
    document.addEventListener('keydown', keyDownCallback)
    document.addEventListener('keyup', keyUpCallback)

    const media = window.matchMedia('(hover: hover)')
    setSupportsHover(media.matches)
    const supportsHoverChangedCallback = () => setSupportsHover(media.matches)
    media.addEventListener('change', supportsHoverChangedCallback)

    return () => {
      document.removeEventListener('keydown', keyDownCallback)
      document.removeEventListener('keyup', keyUpCallback)
      media.removeEventListener('change', supportsHoverChangedCallback)
    }
  })

  const [appInitialDefinition, setAppInitialDefinition] = useState(defaultDrawingDefinition())
  const [isDrawingsDialogOpen, setIsDrawingsDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [orthographicEditorDefinitionIndex, setOrthographicEditorDefinitionIndex] = useState<number|null>(null)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  // toggle swap between 3D object and isometric drawing cards
  const toggleFocus = () => setIsDrawingFocused((focused) => !focused)

  return (
    <DrawingProvider initialDefinition={appInitialDefinition}>
      {/* =====================================================
          Top navigation bar (Figma)
      ===================================================== */}
      <header className='app-topbar'>
        <div className='app-topbar__logo'>STEM SPACE</div>
        <nav className='app-topbar__nav'>
          <button className='app-topbar__nav-btn is-active' type='button'>Explore</button>
          <button className='app-topbar__nav-btn' type='button'>Play</button>
        </nav>
      </header>

      {/* =====================================================
          Three view cards (Figma Explore layout)
          `cards--focused` swaps 3D Object and Isometric Drawing.
      ===================================================== */}
      <section className={`cards${isDrawingFocused ? ' cards--focused' : ''}`}>

        {/* ---- Isometric Drawing card (swaps with 3D when focused) ---- */}
        <div className='card card--iso'>
          <button className='card__header' type='button' onClick={toggleFocus} title='Swap with 3D Object'>
            <span className='card__heading'>
              <h2 className='card__title'>Isometric Drawing</h2>
              <span className='card__swap' aria-hidden='true'>⇄</span>
            </span>
          </button>
          <div className='card__body'>
            <div className='toolbar'>
              <button
                className={`toolbar__btn${highlightKind === 'face' ? ' is-active' : ''}`}
                type='button'
                onClick={() => setHighlightKind('face')}
              >
                Pen
              </button>
              <button className='toolbar__btn' type='button' disabled title='Coming soon'>Eraser</button>
              <button className='toolbar__btn' type='button' disabled title='Coming soon'>Undo</button>
              <button
                className={`toolbar__btn${highlightKind === 'cuboid' ? ' is-active' : ''}`}
                type='button'
                onClick={() => setHighlightKind('cuboid')}
              >
                Delete
              </button>
              <button
                className='toolbar__btn'
                type='button'
                onClick={() => setIsResetDialogOpen(true)}
              >
                Reset structure
              </button>
            </div>
            <div className='viewport'>
              <TransformWrapper centerOnInit={true} initialScale={6} panning={{ velocityDisabled: true }}>
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 600, height: 500 }}>
                    <IsometricViewport
                      highlightKind={highlightKind}
                      canHaveUndefinedSize={false}
                      size={{ width: 600, height: 500, viewBox: '-20 -20 40 40' }}
                    />
                  </div>
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
        </div>

        {/* ---- 3D Object card ---- */}
        <div className='card card--3d'>
          <button className='card__header' type='button' onClick={toggleFocus} title='Swap with Isometric Drawing'>
            <span className='card__heading'>
              <h2 className='card__title'>3D Object</h2>
              <span className='card__swap' aria-hidden='true'>⇄</span>
            </span>
          </button>
          <div className='card__body'>
            <div className='viewport'>
              <span className='viewport__hint'>Drag to rotate</span>
              <IsometricViewport3D placeholder='Loading...' />
            </div>
            <RotationButtons />
          </div>
        </div>

        {/* ---- Coded Plan card ---- */}
        <div className='card card--plan'>
          <div className='card__header'>
            <span className='card__heading'>
              <h2 className='card__title'>Coded Plan</h2>
            </span>
          </div>
          <div className='card__body'>
            <div className='toolbar'>
              <span className='toolbar__label'>Columns / Rows</span>
              <div ref={codedPlanParentRef} style={{ display: 'none' }}>
                <ExportButton asPNG={true} containerParentRef={codedPlanParentRef} />
              </div>
            </div>
            <div className='viewport'>
              <ExportContainer>
                <CodedPlan />
              </ExportContainer>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Advanced tools — existing developer features, kept
          and collapsible so nothing is lost.
      ===================================================== */}
      <details className='advanced'>
        <summary>Advanced tools</summary>

        <div className='advanced__row'>
          <StoreDrawingControls
            setInitialDefinition={setAppInitialDefinition}
            setIsDrawingsDialogOpen={setIsDrawingsDialogOpen}
          />
          <DownloadDefinitionButton downloadAnchor={downloadAnchor} />
          <button className='btn-primary' type='button' onClick={() => setIsExportDialogOpen(true)}>
            Open Export Dialog
          </button>
          <button className='btn-primary' type='button' onClick={() => {
            const name = prompt('Please enter the name of the drawing:', 'Untitled Drawing')
            if (name === null) return
            const definitionIndex = newDefinition('orthographic', name)
            setOrthographicEditorDefinitionIndex(definitionIndex)
          }}>
            Create New Orthographic Drawing
          </button>
        </div>

        <details>
          <summary>Isometric options</summary>
          <div className='advanced__row'>
            <IsometricControls />
          </div>
        </details>

        <details>
          <summary>Orthographic views</summary>
          <div className='advanced__row'>
            <OrthographicControls />
          </div>
          <div ref={orthographicParentRef} style={{ position: 'relative', height: '30vh' }}>
            <div style={{ height: '80%' }}>
              <OrthographicViews isSplittable={false} />
              <ExportContainer display='none'>
                <OrthographicViews isSplittable={true} />
              </ExportContainer>
            </div>
          </div>
        </details>

        <details>
          <summary>Structure inputs</summary>
          <div className='advanced__row'>
            <CuboidStructureInputs />
          </div>
        </details>
      </details>

      {/* Dialogs */}
      <DrawingsDialog
        isOpen={isDrawingsDialogOpen}
        setIsOpen={setIsDrawingsDialogOpen}
        setInitialDefinition={setAppInitialDefinition}
        setOrthographicEditorDefinitionIndex={setOrthographicEditorDefinitionIndex}
      />
      <ExportDialog
        isOpen={isExportDialogOpen}
        setIsOpen={setIsExportDialogOpen}
        downloadAnchor={downloadAnchor}
      />
      <OrthographicEditorDialog
        definitionIndex={orthographicEditorDefinitionIndex}
        setDefinitionIndex={setOrthographicEditorDefinitionIndex}
      />
      <ResetConfirmDialog
        isOpen={isResetDialogOpen}
        close={() => setIsResetDialogOpen(false)}
        onConfirm={() => setAppInitialDefinition(defaultDrawingDefinition())}
      />
    </DrawingProvider>
  )
}

export default App
