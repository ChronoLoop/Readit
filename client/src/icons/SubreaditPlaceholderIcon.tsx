interface SubreaditPlaceholderIconProps {
    size?: string;
}

const SubreaditPlaceholderIcon = ({
    size = '64',
}: SubreaditPlaceholderIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clipPath="url(#clip0_1_6)">
                <circle
                    cx="32"
                    cy="32"
                    r="30.5"
                    fill="#0079D3"
                    stroke="white"
                    strokeWidth="3"
                />
                <path
                    d="M36.873 21.6289C35.5605 21.6289 34.3594 21.9336 33.2695 22.543C32.1914 23.1523 31.2656 23.9902 30.4922 25.0566L30.4746 24.6172L30.2988 21.9805H26.3613V41H30.5625V29.2578C30.7852 28.6953 31.0605 28.1973 31.3887 27.7637C31.7168 27.3301 32.1152 26.9727 32.584 26.6914C33.0176 26.3984 33.5156 26.1816 34.0781 26.041C34.6406 25.9004 35.2734 25.8301 35.9766 25.8301C36.5977 25.8301 37.2188 25.8652 37.8398 25.9355C38.4727 26.0059 39.1113 26.1113 39.7559 26.252L40.3535 22.1035C39.9902 21.9746 39.4863 21.8633 38.8418 21.7695C38.209 21.6758 37.5527 21.6289 36.873 21.6289Z"
                    fill="white"
                />
                <line
                    x1="51.4"
                    y1="8.53847"
                    x2="36.4"
                    y2="47.5385"
                    stroke="white"
                    strokeWidth="3"
                />
            </g>
            <defs>
                <clipPath id="clip0_1_6">
                    <rect width="64" height="64" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};

export default SubreaditPlaceholderIcon;
