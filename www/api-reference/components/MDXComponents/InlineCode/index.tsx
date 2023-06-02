import CopyButton from "@/components/CopyButton"
import clsx from "clsx"

export type InlineCodeProps = React.ComponentProps<"code">

const InlineCode = (props: InlineCodeProps) => {
  const isInline = typeof props.children === "string"
  return (
    <>
      {!isInline && <code {...props} />}
      {isInline && (
        <CopyButton
          text={props.children as string}
          buttonClassName={clsx(
            "bg-transparent border-0 p-0 inline text-medusa-text-subtle dark:text-medusa-text-subtle-dark",
            "active:[&>code]:bg-medusa-bg-subtle-pressed dark:active:[&>code]:bg-medusa-bg-subtle-pressed-dark",
            "focus:[&>code]:bg-medusa-bg-subtle-pressed dark:focus:[&>code]:bg-medusa-bg-subtle-pressed-dark",
            "hover:[&>code]:bg-medusa-bg-subtle-hover dark:hover:[&>code]:bg-medusa-bg-base-hover-dark"
          )}
        >
          <code
            {...props}
            className={clsx(
              "border-medusa-border-base dark:border-medusa-border-base-dark border border-solid",
              "text-medusa-text-subtle dark:text-medusa-text-subtle-dark leading-6",
              "bg-medusa-bg-subtle dark:bg-medusa-bg-base-dark font-monospace text-body-regular rounded py-[1px] px-0.5"
            )}
          />
        </CopyButton>
      )}
    </>
  )
}

export default InlineCode
