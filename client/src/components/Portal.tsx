import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

let rootNode = document.getElementById('root');
if (!rootNode) {
    rootNode = document.createElement('div');
    rootNode.setAttribute('id', 'root');
    document.body.appendChild(rootNode);
}

interface PortalProps {
    children: ReactNode;
}

const Portal = ({ children }: PortalProps) => {
    return rootNode ? createPortal(children, rootNode) : null;
};

export default Portal;
