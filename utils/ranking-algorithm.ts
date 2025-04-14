// Types and interfaces
type Matrix2D = number[][]

interface MedianResult {
    rankings: number[][]
    distance: number
}

export interface RankingMedians {
    cookSayford: MedianResult
    gv: MedianResult
    kemenySnell: MedianResult
    vg: MedianResult
}

// Ranking algorithm
export class RankingAlgorithm {
    private static readonly BIG_INTEGER = 100000

    /**
     * Finds index of element in array
     */
    private static indexOf<T>(source: T[], value: T): number {
        return source.indexOf(value)
    }

    /**
     * Compares elements based on their position in source array
     */
    private static compare<T>(left: T, right: T, source: T[]): number {
        const lIndex = source.indexOf(left)
        const rIndex = source.indexOf(right)
        if (lIndex < rIndex) return 1
        if (lIndex > rIndex) return -1
        return 0
    }

    /**
     * Converts 2D matrix to plain array (elements above main diagonal)
     */
    public static matrixToPlain(matrix: Matrix2D): number[] {
        const plain: number[] = []
        for (let i = 0; i < matrix.length; i++) {
            for (let j = i + 1; j < matrix[i].length; j++) {
                plain.push(matrix[i][j])
            }
        }
        return plain
    }

    /**
     * Generates comparison matrix based on input ranking
     */
    public static generateCompareMatrix(rankedArr: number[]): Matrix2D {
        const sortedRanges = [...rankedArr].sort((a, b) => a - b)
        const size = rankedArr.length
        const result: Matrix2D = Array(size)
            .fill(0)
            .map(() => Array(size).fill(0))

        for (let i = 0; i < size; i++) {
            const rowIndex = this.indexOf(sortedRanges, rankedArr[i])
            for (let j = 0; j < size; j++) {
                const columnIndex = this.indexOf(sortedRanges, rankedArr[j])
                result[rowIndex][columnIndex] = this.compare(rankedArr[i], rankedArr[j], rankedArr)
            }
        }

        return result
    }

    /**
     * Calculates Cook distance between two rankings
     */
    public static calculateCookDistance(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error("Arrays have different length in calculateCookDistance()")
        }
        return a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0)
    }

    /**
     * Calculates Hamming distance between two rankings
     */
    public static calculateHammingDistance(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error("Arrays have different length in calculateHammingDistance()")
        }
        return a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0)
    }

    /**
     * Generates all permutations of an array
     */
    private static generatePermutations<T>(arr: T[]): T[][] {
        if (arr.length <= 1) return [arr]

        const permutations: T[][] = []
        const smallerPerms = this.generatePermutations(arr.slice(1))

        const firstElement = arr[0]
        for (const permutation of smallerPerms) {
            for (let i = 0; i <= permutation.length; i++) {
                const prefix = permutation.slice(0, i)
                const suffix = permutation.slice(i)
                permutations.push([...prefix, firstElement, ...suffix])
            }
        }

        return permutations
    }

    /**
     * Process rankings and calculate all medians
     */
    public static processRankings(expertRankings: number[][]): RankingMedians {
        // Initialize result variables
        let cookSayfordMinSum = this.BIG_INTEGER
        let gvMinMax = this.BIG_INTEGER
        let kemenySnellMinSum = this.BIG_INTEGER
        let vgMinMax = this.BIG_INTEGER

        // Initialize median arrays
        const cookSayfordMedians: number[][] = []
        const gvMedians: number[][] = []
        const kemenySnellMedians: number[][] = []
        const vgMedians: number[][] = []

        // Generate all possible permutations
        const baseRanking = Array.from({ length: expertRankings[0].length }, (_, i) => i + 1)
        const allPermutations = this.generatePermutations(baseRanking)

        // Convert expert rankings to plain matrices for Hamming distance
        const expertPlainMatrices = expertRankings.map((ranking) => this.matrixToPlain(this.generateCompareMatrix(ranking)))

        // Process each permutation
        for (const permutation of allPermutations) {
            // Calculate Cook distances
            let sumCookDistances = 0
            let maxCookDistance = -1

            for (const expertRanking of expertRankings) {
                const cookDist = this.calculateCookDistance(permutation, expertRanking)
                sumCookDistances += cookDist
                maxCookDistance = Math.max(maxCookDistance, cookDist)
            }

            // Update Cook-Sayford median
            if (sumCookDistances < cookSayfordMinSum) {
                cookSayfordMinSum = sumCookDistances
                cookSayfordMedians.length = 0
                cookSayfordMedians.push([...permutation])
            } else if (sumCookDistances === cookSayfordMinSum) {
                cookSayfordMedians.push([...permutation])
            }

            // Update GV median
            if (maxCookDistance < gvMinMax) {
                gvMinMax = maxCookDistance
                gvMedians.length = 0
                gvMedians.push([...permutation])
            } else if (maxCookDistance === gvMinMax) {
                gvMedians.push([...permutation])
            }

            // Calculate Hamming distances
            const permutationPlainMatrix = this.matrixToPlain(this.generateCompareMatrix(permutation))

            let sumHammingDistances = 0
            let maxHammingDistance = -1

            for (const expertPlainMatrix of expertPlainMatrices) {
                const hammingDist = this.calculateHammingDistance(permutationPlainMatrix, expertPlainMatrix)
                sumHammingDistances += hammingDist
                maxHammingDistance = Math.max(maxHammingDistance, hammingDist)
            }

            // Update Kemeny-Snell median
            if (sumHammingDistances < kemenySnellMinSum) {
                kemenySnellMinSum = sumHammingDistances
                kemenySnellMedians.length = 0
                kemenySnellMedians.push([...permutation])
            } else if (sumHammingDistances === kemenySnellMinSum) {
                kemenySnellMedians.push([...permutation])
            }

            // Update VG median
            if (maxHammingDistance < vgMinMax) {
                vgMinMax = maxHammingDistance
                vgMedians.length = 0
                vgMedians.push([...permutation])
            } else if (maxHammingDistance === vgMinMax) {
                vgMedians.push([...permutation])
            }
        }

        return {
            cookSayford: { rankings: cookSayfordMedians, distance: cookSayfordMinSum },
            gv: { rankings: gvMedians, distance: gvMinMax },
            kemenySnell: { rankings: kemenySnellMedians, distance: kemenySnellMinSum },
            vg: { rankings: vgMedians, distance: vgMinMax },
        }
    }
}
