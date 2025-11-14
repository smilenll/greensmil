interface PictureFrameProps {
  children: React.ReactNode;
  className?: string;
  mobileFrameless?: boolean;
}

export function PictureFrame({ children, className = '', mobileFrameless = true }: PictureFrameProps) {
  const outerFrameClasses = mobileFrameless
    ? 'border-0 md:border-[15px] md:border-[#555] md:dark:border-[#2a2a2a] shadow-none md:shadow-[_-3px_-3px_12px_rgba(0,0,0,0.3),_3px_3px_12px_rgba(0,0,0,0.5)]'
    : 'border-[15px] border-[#555] dark:border-[#2a2a2a] shadow-[_-3px_-3px_12px_rgba(0,0,0,0.3),_3px_3px_12px_rgba(0,0,0,0.5)]';

  const matBoardClasses = mobileFrameless
    ? 'border-0 md:border-[70px] md:border-white md:dark:border-[#1a1a1a] shadow-none md:shadow-[inset_0_0_20px_rgba(0,0,0,0.1),_-2px_-2px_8px_rgba(0,0,0,0.2)]'
    : 'border-[70px] border-white dark:border-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.1),_-2px_-2px_8px_rgba(0,0,0,0.2)]';

  const imageBorderClasses = mobileFrameless
    ? 'border-0 md:border-t-2 md:border-l-2 md:border-b-2 md:border-r-2 md:border-t-[#aaa] md:border-l-[#aaa] md:border-b-[#ccc] md:border-r-[#ccc] md:dark:border-t-[#333] md:dark:border-l-[#333] md:dark:border-b-[#555] md:dark:border-r-[#555]'
    : 'border-t-2 border-l-2 border-b-2 border-r-2 border-t-[#aaa] border-l-[#aaa] border-b-[#ccc] border-r-[#ccc] dark:border-t-[#333] dark:border-l-[#333] dark:border-b-[#555] dark:border-r-[#555]';

  return (
    <div className={`relative mx-auto p-0 ${outerFrameClasses} ${className}`}>
      <div className={`relative p-0 m-0 ${matBoardClasses}`}>
        <div className={`block w-full h-auto ${imageBorderClasses}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
