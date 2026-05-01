import React from 'react'

const STEPS = [
  { key: 'diagnostic', label: '研读诊断' },
  { key: 'sorting', label: '碎片归筐' },
  { key: 'sequencing', label: '脉络排序' },
  { key: 'archive', label: '档案生成' },
]

interface RepairStepperProps {
  currentStep: string
}

const RepairStepper: React.FC<RepairStepperProps> = ({ currentStep }) => {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep)

  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentIndex
        const isCompleted = idx < currentIndex
        return (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              isCompleted ? 'bg-zhuqing text-white' :
              isActive ? 'bg-zhusha text-white' :
              'bg-danmo-light text-danmo'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {isCompleted ? '✓' : idx + 1}
              </span>
              {step.label}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${
                isCompleted ? 'bg-zhuqing' : 'bg-danmo-light'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default RepairStepper
