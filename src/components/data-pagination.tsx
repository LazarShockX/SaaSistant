import { Button } from "@/components/ui/button";

interface Props {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const DataPagination = ({ page, totalPages, onPageChange }: Props) => {
    // // Prevent accessing out of bounds pages
    // useEffect(() => {
    //     const isPageInvalid = page < 1 || (totalPages > 0 && page > totalPages);
    //     if (isPageInvalid) {
    //         onPageChange(1);
    //     }
    // }, [page, totalPages, onPageChange]);

    // const handlePageChange = (newPage: number) => {
    //     // Validate page bounds - redirect to page 1 if invalid
    //     const isPageInvalid = newPage < 1 || (totalPages > 0 && newPage > totalPages);
    //     if (isPageInvalid) {
    //         onPageChange(1);
    //     } else {
    //         onPageChange(newPage);
    //     }
    // };

    return (
        <div className="flex items-center justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {page} of {totalPages || 1}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button disabled={page === 1} variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))}>
                    Previous
                </Button>
                <Button disabled={page === totalPages || totalPages === 0} variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
                    Next
                </Button>
            </div>
        </div>
    )
}
