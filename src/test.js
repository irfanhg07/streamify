import bcrypt from "bcrypt";

const testPasswordComparison = async () => {
    const plaintextPassword = "irfan"; // Replace with the input password
    const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
    console.log("plaintext password: ", plaintextPassword);
    console.log("Hashed password : ", hashedPassword);
    
    
    // const hashedPassword = "$2b$10$NamBXdbvlfgEPHDWd/qoNeo7AlNfax9rCvhhl4nuDURKsfi2.RlCS"; // Replace with DB hash

    const isMatch = await bcrypt.compare(plaintextPassword, hashedPassword);
    console.log("Does the password match?", isMatch);
};

testPasswordComparison();
