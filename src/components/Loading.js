import Spinner from 'react-bootstrap/Spinner';

const Loading = () => {
    return (
        <div className='text-center my-5'>
            <Spinner animation="grow"  variant="primary"/>
            <p className='my-3 text-primary'>Loading Data...</p>
        </div>
    );
}

export default Loading
