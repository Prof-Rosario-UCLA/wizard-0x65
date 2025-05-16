function Button({ children }) {
  return (
    <>
      <div className="flex">
        <div className="border rounded-md px-4 py-2">{children}</div>
      </div>
    </>
  );
}

export { Button };
