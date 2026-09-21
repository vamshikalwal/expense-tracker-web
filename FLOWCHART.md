# Expense Tracker App Flowchart

## Main application flow

```mermaid
flowchart TD
    A([App starts]) --> B{Is user authenticated?}
    B -- No --> C[Open Login/Register page]
    C --> D[User enters credentials]
    D --> E[AuthContext.signIn()]
    E --> F[Call authApi.login()]
    F --> G{Token returned successfully?}
    G -- No --> H[Show error]
    G -- Yes --> I[Save token to localStorage]
    I --> J[Save user info to localStorage]
    J --> K[Set auth state]
    K --> L[Allow access to protected routes]

    B -- Yes --> L
    L --> M{Which page is opened?}
    M --> N[/dashboard]
    M --> O[/transactions]
    M --> P[/banks]
    M --> Q[/cards]
    M --> R[/budgets]
    M --> S[/reports]
    M --> T[/settings]

    N --> N1[Dashboard page loads]
    N1 --> N2[getSummary()]
    N1 --> N3[getCategoryReport()]
    N1 --> N4[getDailyReport()]
    N1 --> N5[getTransactions()]
    N2 --> N6[Display total spending, balance, charts]
    N3 --> N6
    N4 --> N6
    N5 --> N6

    P --> P1[BanksPage]
    P1 --> P2[ManagePage kind = banks]
    P2 --> P3[getBanks()]
    P3 --> P4{Success?}
    P4 -- Yes --> P5[Show bank cards]
    P4 -- No --> P6[Show error]
    P5 --> P7{User action}
    P7 -- Add --> P8[Open modal]
    P8 --> P9[Submit name]
    P9 --> P10[createBank()]
    P10 --> P11[Reload banks]

    P7 -- Edit --> P12[Open edit modal]
    P12 --> P13[Submit updated name]
    P13 --> P14[updateBank()]
    P14 --> P11

    P7 -- Remove --> P15[Open delete confirmation]
    P15 --> P16[Confirm delete]
    P16 --> P17[deleteBank()]
    P17 --> P11

    P7 -- Open transactions --> P18[getBankTransactions(item.id)]
    P18 --> P19[Show linked transaction modal]

    Q --> Q1[CardsPage]
    Q1 --> Q2[ManagePage kind = cards]
    Q2 --> Q3[getCards()]
    Q3 --> Q4{Success?}
    Q4 -- Yes --> Q5[Show card cards]
    Q4 -- No --> Q6[Show error]
    Q5 --> Q7{User action}
    Q7 -- Add --> Q8[Open modal]
    Q8 --> Q9[Submit name]
    Q9 --> Q10[createCard()]
    Q10 --> Q11[Reload cards]

    Q7 -- Edit --> Q12[Open edit modal]
    Q12 --> Q13[Submit updated name]
    Q13 --> Q14[updateCard()]
    Q14 --> Q11

    Q7 -- Remove --> Q15[Open delete confirmation]
    Q15 --> Q16[Confirm delete]
    Q16 --> Q17[deleteCard()]
    Q17 --> Q11

    Q7 -- Open transactions --> Q18[getCardTransactions(item.id)]
    Q18 --> Q19[Show linked transaction modal]

    R --> R1[BudgetsPage]
    R1 --> R2[getBudgets(currentMonth)]
    R2 --> R3{Success?}
    R3 -- Yes --> R4[Display category budgets]
    R3 -- No --> R5[Show error]
    R4 --> R6{Create budget?}
    R6 -- Yes --> R7[Open budget modal]
    R7 --> R8[Submit category, limit, month]
    R8 --> R9[createBudget()]
    R9 --> R10[Refresh budgets]

    S --> S1[ReportsPage]
    S1 --> S2[Promise.all(
    getSummary(),
    getCategoryReport(),
    getCardReport(),
    getDailyReport(),
    getBudgetSummary()
    )]
    S2 --> S3{Success?}
    S3 -- Yes --> S4[Store report data]
    S3 -- No --> S5[Show error]
    S4 --> S6[Render charts and stats]
```

## Short explanation

1. The app first checks whether a user is logged in.
2. If not, the user goes to login/register.
3. After login, the app stores the token and user in browser storage.
4. The user is redirected to a protected route.
5. Depending on the URL, the matching page loads data from the backend.
6. The page updates the state and renders charts, cards, and transaction lists.
7. User actions like add, edit, delete, or view details trigger API calls and refresh the UI.

## File location

This file was created here:

- FLOWCHART.md
