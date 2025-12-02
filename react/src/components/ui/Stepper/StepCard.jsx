import Card from "../Card/Card";

const StepCard = ({ steps, currentStep, children, showTitle = true }) => {
  return (
    <Card title={showTitle && steps[currentStep].title} className="step-header">
      {children}
    </Card>
  );
};

export default StepCard;
