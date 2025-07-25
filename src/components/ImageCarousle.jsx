import Carousel from "react-bootstrap/Carousel";

function ImageCarousle({ images }) {
  return (
    <Carousel fade>
      {images.map((image, index) => (
        <Carousel.Item key={index}>
          <img
            src={image}
            alt={`Slide ${index}`}
            className="d-block w-100"
            style={{ objectFit: "cover", height: "400px" }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default ImageCarousle;
