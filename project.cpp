 #include <iostream>
#include <fstream>
#include <string>
#include <iomanip>
using namespace std;

const int MAX_SUBJECTS = 5;
const string SUBJECT_NAMES[MAX_SUBJECTS] = {"Math", "Science", "English", "History", "Computer"};
const int MAX_STUDENTS = 100;

class Student {
private:
    string name;
    int rollNumber;
    float marks[MAX_SUBJECTS];
    float totalMarks;
    float percentage;
    char overallGrade;
    char subjectGrades[MAX_SUBJECTS];

    char calculateGrade(float marks) {
        if (marks >= 90) return 'A';
        else if (marks >= 80) return 'B';
        else if (marks >= 70) return 'C';
        else if (marks >= 60) return 'D';
        else if (marks >= 50) return 'E';
        else return 'F';
    }

public:
    Student() : name(""), rollNumber(0), totalMarks(0), percentage(0), overallGrade('F') {
        for (int i = 0; i < MAX_SUBJECTS; i++) {
            marks[i] = 0;
            subjectGrades[i] = 'F';
        }
    }

    void inputDetails() {
        cout << "\nEnter student name: ";
        cin.ignore();                                                                                             //clear input buffer
        getline(cin, name);
        
        cout << "Enter roll number: ";
        cin >> rollNumber;
        
        cout << "Enter marks for " << MAX_SUBJECTS << " subjects (out of 100):\n";
        for (int i = 0; i < MAX_SUBJECTS; i++) {
            cout << SUBJECT_NAMES[i] << ": ";
            cin >> marks[i];
            // Validate marks
            while (marks[i] < 0 || marks[i] > 100) {
                cout << "Invalid marks! Enter again (0-100): ";
                cin >> marks[i];
            }
        }
        
        calculateGrades();
    }

    void calculateGrades() {
         totalMarks = 0;
        for (int i = 0; i < MAX_SUBJECTS; i++) {
            totalMarks += marks[i];
        }
        
         percentage = (totalMarks / (MAX_SUBJECTS * 100)) * 100;
        
         overallGrade = calculateGrade(percentage);
        
         for (int i = 0; i < MAX_SUBJECTS; i++) {
            subjectGrades[i] = calculateGrade(marks[i]);
        }
    }

    void displayDetails() const {
        cout << "\nStudent Details:\n";
        cout << "----------------------------------------\n";
        cout << setw(20) << "Name:" << name << endl;
        cout << setw(20) << "Roll Number:" << rollNumber << endl;
        cout << "\nSubject-wise Performance:\n";
        cout << setw(15) << "Subject" << setw(10) << "Marks" << "Grade\n";
        for (int i = 0; i < MAX_SUBJECTS; i++) {
            cout << setw(15) << SUBJECT_NAMES[i] 
                 << setw(10) << marks[i] 
                 << subjectGrades[i] << endl;
        }
        cout << "\nOverall Performance:\n";
        cout << setw(20) << "Total Marks:" << totalMarks << "/" << MAX_SUBJECTS*100 << endl;
        cout << setw(20) << "Percentage:" << fixed << setprecision(2) << percentage << "%" << endl;
        cout << setw(20) << "Overall Grade:" << overallGrade << endl;
        cout << "----------------------------------------\n";
    }

    void saveToFile(ofstream &file) const {
        file << name << endl;
        file << rollNumber << endl;
        for (int i = 0; i < MAX_SUBJECTS; i++) {
            file << marks[i] << " ";
        }
        file << endl;
        file << totalMarks << endl;
        file << percentage << endl;
        file << overallGrade << endl;
        for (int i = 0; i < MAX_SUBJECTS; i++) {
            file << subjectGrades[i] << " ";
        }
        file << endl;
    }

    void loadFromFile(ifstream &file) {
        file.ignore();
        getline(file, name);
        file >> rollNumber;
        for (int i = 0; i < MAX_SUBJECTS; i++) {
            file >> marks[i];
        }
        file >> totalMarks;
        file >> percentage;
        file >> overallGrade;
        for (int i = 0; i < MAX_SUBJECTS; i++) {
            file >> subjectGrades[i];
        }
    }

    int getRollNumber() const {
        return rollNumber;
    }
};

class ReportCardSystem {
private:
    Student students[MAX_STUDENTS];
    int studentCount;

public:
    ReportCardSystem() : studentCount(0) {}

    void addStudent() {
        if (studentCount >= MAX_STUDENTS) {
            cout << "Maximum number of students reached!\n";
            return;
        }
        
        students[studentCount].inputDetails();                      
        studentCount++;
        cout << "Student added successfully!\n";
    }

    void displayAllStudents() const {              //const - fun does not modify any member function
        if (studentCount == 0) {
            cout << "No students in the system!\n";
            return;
        }
        
        cout << "\n--- ALL STUDENTS REPORT ---\n";
        for (int i = 0; i < studentCount; i++) {
            students[i].displayDetails();
        }
        cout << "--------------------------\n";
    }

    void searchStudent() const {
        if (studentCount == 0) {
            cout << "No students in the system!\n";
            return;
        }
        
        int roll;
        cout << "Enter roll number to search: ";
        cin >> roll;
        
        bool found = false;
        for (int i = 0; i < studentCount; i++) {
            if (students[i].getRollNumber() == roll) {
                cout << "\n--- STUDENT FOUND ---";
                students[i].displayDetails();
                found = true;
                break;
            }
        }
        
        if (!found) {
            cout << "Student with roll number " << roll << " not found!\n";
        }
    }

    void saveToFile() const {
        ofstream file("students.dat");
        if (!file) {
            cout << "Error opening file for writing!\n";
            return;
        }
        
        file << studentCount << endl;
        for (int i = 0; i < studentCount; i++) {
            students[i].saveToFile(file);
        }
        
        file.close();
        cout << "Data saved to file successfully!\n";
    }

    void loadFromFile() {
        ifstream file("students.dat");
        if (!file) {
            cout << "No existing data file found. Starting fresh.\n";
            return;
        }
        
        file >> studentCount;
        for (int i = 0; i < studentCount; i++) {
            students[i].loadFromFile(file);
        }
        
        file.close();
        cout << "Data loaded from file successfully!\n";
    }
};

void displayMenu() {
    cout << "\nSTUDENT REPORT CARD SYSTEM\n";
    cout << "1. Add Student\n";
    cout << "2. Display All Students\n";
    cout << "3. Search Student\n";
    cout << "4. Save Data to File\n";
    cout << "5. Load Data from File\n";
    cout << "6. Exit\n";
    cout << "Enter your choice: ";
}

int main() {
    ReportCardSystem system;
    system.loadFromFile(); 
    
    int choice;
    do {
        displayMenu();
        cin >> choice;
        
        switch (choice) {
            case 1:
                system.addStudent();
                break;
            case 2:
                system.displayAllStudents();
                break;
            case 3:
                system.searchStudent();
                break;
            case 4:
                system.saveToFile();
                break;
            case 5:
                system.loadFromFile();
                break;
            case 6:
                cout << "Exiting program. Goodbye!\n";
                break;
            default:
                cout << "Invalid choice. Please try again.\n";
        }
    } while (choice != 6);
    
    return 0;
}