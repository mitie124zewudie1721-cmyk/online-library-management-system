// frontend/src/components/common/Loader.jsx
const Loader = ({ size = 'medium' }) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-10 h-10',
        large: 'w-16 h-16',
    };

    return (
        <div className="flex justify-center items-center min-h-[200px]">
            <div className={`animate-spin rounded-full border-t-4 border-blue-600 ${sizeClasses[size] || sizeClasses.medium}`}></div>
        </div>
    );
};

export default Loader;