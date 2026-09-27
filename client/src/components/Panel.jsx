import React from 'react';

/**
 * Shared panel chrome — every dashboard section uses the same heading rhythm.
 */
export default function Panel({
  title,
  eyebrow,
  action,
  children,
  className = '',
  bodyClassName = '',
  as: Tag = 'section',
  ...rest
}) {
  return (
    <Tag className={`panel ${className}`.trim()} {...rest}>
      {(title || action) && (
        <header className="panel-head">
          <div className="panel-headings">
            {eyebrow && <p className="panel-eyebrow">{eyebrow}</p>}
            {title && <h2 className="panel-title">{title}</h2>}
          </div>
          {action && <div className="panel-action">{action}</div>}
        </header>
      )}
      <div className={`panel-body ${bodyClassName}`.trim()}>{children}</div>
    </Tag>
  );
}
