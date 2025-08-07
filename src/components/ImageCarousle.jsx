import Carousel from "react-bootstrap/Carousel";

function ImageCarousle({ images , height , width }) {
  return (
    <Carousel fade>
      {images.map((image, index) => (
        <Carousel.Item key={index}>
          <img
            src={image}
            alt={`Slide ${index}`}
            className="d-block w-100"
            style={{ objectFit: "cover", height: height || "400px", width: width || "100%" }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default ImageCarousle;
