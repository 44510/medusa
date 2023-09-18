import { useLearningPath } from "@site/src/providers/LearningPath"
import React from "react"
import LearningPathStepActions from "./Actions"
import clsx from "clsx"
import IconCircleDottedLine from "@site/src/theme/Icon/CircleDottedLine"
import Link from "@docusaurus/Link"
import { CheckCircleSolid, CircleMiniSolid } from "@medusajs/icons"

type LearningPathStepsProps = {
  onFinish?: () => void
  onClose?: () => void
}

const LearningPathSteps: React.FC<LearningPathStepsProps> = ({ ...rest }) => {
  const { path, currentStep, goToStep } = useLearningPath()

  if (!path) {
    return <></>
  }

  return (
    <>
      <div className="overflow-auto basis-3/4">
        {path.steps.map((step, index) => (
          <div
            className={clsx(
              "border-0 border-b border-solid border-medusa-border-base dark:border-medusa-border-base-dark",
              "relative p-1"
            )}
            key={index}
          >
            <div className={clsx("flex items-center gap-1")}>
              <div className="w-2 flex-none flex items-center justify-center">
                {index === currentStep && (
                  <IconCircleDottedLine
                    className="shadow-active dark:shadow-active-dark rounded-full"
                    iconColorClassName="stroke-medusa-fg-interactive dark:stroke-medusa-fg-interactive-dark"
                  />
                )}
                {index < currentStep && (
                  <CheckCircleSolid className="text-medusa-fg-interactive dark:text-medusa-fg-interactive-dark" />
                )}
                {index > currentStep && (
                  <CircleMiniSolid className="text-medusa-fg-subtle dark:text-medusa-fg-subtle-dark" />
                )}
              </div>
              <span
                className={clsx(
                  "text-compact-medium-plus text-medusa-fg-base dark:text-medusa-fg-base-dark"
                )}
              >
                {step.title}
              </span>
            </div>
            {index === currentStep && (
              <div className={clsx("flex items-center gap-1")}>
                <div className="w-2 flex-none"></div>
                <div
                  className={clsx(
                    "text-medium text-medusa-fg-subtle dark:text-medusa-fg-subtle-dark mt-1"
                  )}
                >
                  {step.descriptionJSX ?? step.description}
                </div>
              </div>
            )}
            {index < currentStep && (
              <Link
                href={step.path}
                className={clsx("absolute top-0 left-0 w-full h-full")}
                onClick={(e) => {
                  e.preventDefault()
                  goToStep(index)
                }}
              />
            )}
          </div>
        ))}
      </div>
      <LearningPathStepActions {...rest} />
    </>
  )
}

export default LearningPathSteps