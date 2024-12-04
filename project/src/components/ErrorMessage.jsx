function ErrorMessage({ message, type = 'error' }) {
    const styles = {
      error: 'bg-red-50 border-red-200 text-red-600',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      info: 'bg-blue-50 border-blue-200 text-blue-600'
    };
  
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className={`border px-4 py-3 rounded-lg ${styles[type]}`}>
          <p>{message}</p>
        </div>
      </div>
    );
  }
  
  export default ErrorMessage;