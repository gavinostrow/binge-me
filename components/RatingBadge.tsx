import React from 'react';
import PropTypes from 'prop-types';

const RatingBadge = ({ rating }) => {
    let color;

    if (rating >= 4.5) {
        color = 'green'; // Excellent
    } else if (rating >= 3.5) {
        color = 'yellowgreen'; // Good
    } else if (rating >= 2.5) {
        color = 'orange'; // Average
    } else {
        color = 'red'; // Poor
    }

    return (
        <div style={{
            backgroundColor: color,
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            display: 'inline-block'
        }}>
            {rating} / 5
        </div>
    );
};

RatingBadge.propTypes = {
    rating: PropTypes.number.isRequired,
};

export default RatingBadge;