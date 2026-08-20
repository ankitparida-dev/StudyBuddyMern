import React from 'react';
import '../../styles/Loader.css';

const Loader = ({ 
  size = 'medium', 
  text = 'Loading...',
  variant = 'primary',
  type = 'spinner',
  showText = true,
  className = '',
  progress = null,
  animated = true,
  fullScreen = false,
  overlay = false,
  children = null
}) => {
  // Get size class
  const sizeClass = `loader-${size}`;
  
  // Get variant class
  const variantClass = `loader-${variant}`;
  
  // Get type class
  const typeClass = `loader-${type}`;
  
  // Build container classes
  const containerClasses = [
    'loader-container',
    sizeClass,
    variantClass,
    typeClass,
    className,
    animated ? 'loader-animated' : 'loader-static',
    fullScreen ? 'loader-fullscreen' : '',
    overlay ? 'loader-overlay' : '',
    !text || !showText ? 'loader-no-text' : ''
  ].filter(Boolean).join(' ');

  // Render different loader types
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="loader-dots">
            <div className="loader-dot" />
            <div className="loader-dot" />
            <div className="loader-dot" />
          </div>
        );
      
      case 'pulse':
        return (
          <div className="loader-pulse">
            <div className="pulse-ring" />
          </div>
        );
      
      case 'icon':
        return (
          <div className="loader-icon">
            <i className="fas fa-spinner" />
          </div>
        );
      
      case 'bounce':
        return (
          <div className="loader-icon bounce">
            <i className="fas fa-book-open" />
          </div>
        );
      
      case 'progress':
        return (
          <div className="loader-with-progress">
            <div className="loader-spinner" />
            {progress !== null && (
              <div className="progress-track">
                <div 
                  className="progress-bar" 
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
            {showText && text && (
              <p className="loader-text">
                {text}
                {progress !== null && (
                  <span className="progress-percentage">
                    {Math.min(100, Math.max(0, Math.round(progress)))}%
                  </span>
                )}
              </p>
            )}
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="skeleton-loader">
            <div className="skeleton-line long" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
          </div>
        );
      
      case 'spinner':
      default:
        return (
          <>
            <div className="loader-spinner" />
            {showText && text && (
              <p className="loader-text">
                {text}
                {progress !== null && (
                  <span className="progress-percentage">
                    {Math.min(100, Math.max(0, Math.round(progress)))}%
                  </span>
                )}
              </p>
            )}
          </>
        );
    }
  };

  // Render children if provided
  if (children) {
    return (
      <div className={containerClasses}>
        {renderLoader()}
        {children}
      </div>
    );
  }

  // Render fullscreen loader
  if (fullScreen) {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        {renderLoader()}
      </div>
    );
  }

  // Render overlay loader
  if (overlay) {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        <div className="loader-content">
          {renderLoader()}
        </div>
      </div>
    );
  }

  // Default render
  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {renderLoader()}
    </div>
  );
};

// ===== VARIANT COMPONENTS =====
export const SpinnerLoader = (props) => (
  <Loader {...props} type="spinner" />
);

export const DotsLoader = (props) => (
  <Loader {...props} type="dots" />
);

export const PulseLoader = (props) => (
  <Loader {...props} type="pulse" />
);

export const IconLoader = (props) => (
  <Loader {...props} type="icon" />
);

export const BounceLoader = (props) => (
  <Loader {...props} type="bounce" />
);

export const ProgressLoader = ({ progress, ...props }) => (
  <Loader {...props} type="progress" progress={progress} />
);

export const SkeletonLoader = (props) => (
  <Loader {...props} type="skeleton" />
);

// ===== PRESET LOADERS =====
export const PageLoader = (props) => (
  <Loader {...props} fullScreen size="large" text="Loading page..." />
);

export const SectionLoader = (props) => (
  <Loader {...props} size="medium" text="Loading content..." />
);

export const ButtonLoader = ({ className, ...props }) => (
  <Loader 
    {...props} 
    size="small" 
    text="" 
    className={`btn-loader ${className || ''}`}
  />
);

export const InlineLoader = ({ className, ...props }) => (
  <Loader 
    {...props} 
    size="small" 
    className={`inline-loader ${className || ''}`}
  />
);

export default Loader;