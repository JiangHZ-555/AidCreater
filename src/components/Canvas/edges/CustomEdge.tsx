import React from 'react';
import {
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from '@xyflow/react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    // 这里可以添加删除边的逻辑
    console.log('删除边:', id);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#1890ff' : '#b1b1b7',
          strokeDasharray: selected ? '5,5' : 'none',
        }}
      />

      {/* 边的标签和删除按钮 */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {selected && (
            <Button
              type="primary"
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={event => onEdgeClick(event, id)}
              style={{
                width: 20,
                height: 20,
                padding: 0,
                minWidth: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            />
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
