const SectionWrapper = ({ title, children }) => (
    <div className="mb-4">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
  
  export default SectionWrapper;
  