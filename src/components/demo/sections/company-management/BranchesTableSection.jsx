import React, { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../../data/variables';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import styles from './css/branchesTable.module.css';

const BranchesTableSection = ({ branches, companyName, onAddBranch, onEditBranch, onDeleteBranch }) => {
  const ingles = useStore(isEnglish);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => (
          <span className={styles.idCell}>#{info.getValue()}</span>
        ),
        size: 80,
      }),
      columnHelper.accessor('name', {
        header: ingles ? 'Branch Name' : 'Nombre de Sucursal',
        cell: info => (
          <div className={styles.nameCell}>
            <span className={styles.branchName}>{info.getValue()}</span>
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor('city', {
        header: ingles ? 'City' : 'Ciudad',
        cell: info => (
          <span className={styles.cityCell}>{info.getValue()}</span>
        ),
        size: 150,
      }),
      columnHelper.accessor('employees', {
        header: ingles ? 'Employees' : 'Empleados',
        cell: info => (
          <span className={styles.employeesCell}>
            {info.getValue()} {ingles ? 'employees' : 'empleados'}
          </span>
        ),
        size: 120,
      }),
      columnHelper.accessor('address', {
        header: ingles ? 'Address' : 'Dirección',
        cell: info => (
          <span className={styles.addressCell} title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
        size: 300,
      }),
      columnHelper.display({
        id: 'actions',
        header: ingles ? 'Actions' : 'Acciones',
        cell: ({ row }) => (
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.actionBtn} ${styles.editBtn}`} 
              title={ingles ? 'Edit Branch' : 'Editar Sucursal'}
              onClick={() => handleEdit(row.original)}
            >
              ✏️
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.viewBtn}`} 
              title={ingles ? 'View Details' : 'Ver Detalles'}
              onClick={() => handleView(row.original)}
            >
              👁️
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.deleteBtn}`} 
              title={ingles ? 'Delete Branch' : 'Eliminar Sucursal'}
              onClick={() => handleDelete(row.original)}
            >
              🗑️
            </button>
          </div>
        ),
        enableSorting: false,
        size: 140,
      }),
    ],
    [ingles, columnHelper]
  );

  const table = useReactTable({
    data: branches,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  const handleEdit = (branch) => {
    onEditBranch && onEditBranch(branch);
  };

  const handleView = (branch) => {
    alert(`${ingles ? 'Viewing details for branch' : 'Viendo detalles de la sucursal'}: ${branch.name}`);
  };

  const handleDelete = (branch) => {
    setShowDeleteConfirm(branch);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteBranch && onDeleteBranch(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
      
      const message = ingles 
        ? `Branch "${showDeleteConfirm.name}" deleted successfully!`
        : `¡Sucursal "${showDeleteConfirm.name}" eliminada exitosamente!`;
      
      setTimeout(() => alert(message), 100);
    }
  };

  const textos = {
    es: {
      title: 'Sucursales',
      searchPlaceholder: 'Buscar sucursales...',
      addBranch: 'Agregar Sucursal',
      showingText: 'Mostrando',
      toText: 'a',
      ofText: 'de',
      entriesText: 'sucursales',
      noEntriesText: 'No se encontraron sucursales',
      previousText: 'Anterior',
      nextText: 'Siguiente',
      deleteConfirmTitle: 'Confirmar Eliminación',
      deleteConfirmText: '¿Estás seguro de que deseas eliminar esta sucursal?',
      deleteConfirmSubtext: 'Esta acción no se puede deshacer.',
      cancelText: 'Cancelar',
      deleteText: 'Eliminar'
    },
    en: {
      title: 'Branches',
      searchPlaceholder: 'Search branches...',
      addBranch: 'Add Branch',
      showingText: 'Showing',
      toText: 'to',
      ofText: 'of',
      entriesText: 'branches',
      noEntriesText: 'No branches found',
      previousText: 'Previous',
      nextText: 'Next',
      deleteConfirmTitle: 'Confirm Deletion',
      deleteConfirmText: 'Are you sure you want to delete this branch?',
      deleteConfirmSubtext: 'This action cannot be undone.',
      cancelText: 'Cancel',
      deleteText: 'Delete'
    }
  };

  const currentTextos = ingles ? textos.en : textos.es;

  return (
    <div className={styles.branchesSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleSection}>
          <h3>{currentTextos.title}</h3>
          <div className={styles.statsInfo}>
            <span className={styles.totalCount}>
              {branches.length} {currentTextos.entriesText}
            </span>
            <span className={styles.companyName}>
              {companyName}
            </span>
          </div>
        </div>
        <div className={styles.headerControls}>
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={currentTextos.searchPlaceholder}
            className={styles.searchInput}
          />
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} style={{ width: header.getSize() }}>
                      <div className={styles.headerContent}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={header.column.getCanSort() ? styles.sortableHeader : ''}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <span className={styles.sortIcon}>
                              {{
                                asc: ' 🔼',
                                desc: ' 🔽',
                              }[header.column.getIsSorted()] ?? 
                              (header.column.getCanSort() ? ' ↕️' : null)}
                            </span>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={styles.tableRow}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          {table.getFilteredRowModel().rows.length > 0 ? (
            `${currentTextos.showingText} ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} ${currentTextos.toText} ${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} ${currentTextos.ofText} ${table.getFilteredRowModel().rows.length} ${currentTextos.entriesText}`
          ) : (
            currentTextos.noEntriesText
          )}
        </div>
        <div className={styles.paginationControls}>
          <button
            className={`${styles.paginationBtn} ${styles.navBtn} ${!table.getCanPreviousPage() ? styles.disabled : ''}`}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ‹ {currentTextos.previousText}
          </button>
          
          {Array.from({ length: table.getPageCount() }, (_, i) => i).map(page => (
            <button
              key={page}
              className={`${styles.paginationBtn} ${table.getState().pagination.pageIndex === page ? styles.active : ''}`}
              onClick={() => table.setPageIndex(page)}
            >
              {page + 1}
            </button>
          ))}
          
          <button
            className={`${styles.paginationBtn} ${styles.navBtn} ${!table.getCanNextPage() ? styles.disabled : ''}`}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {currentTextos.nextText} ›
          </button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              <h4>{currentTextos.deleteConfirmTitle}</h4>
            </div>
            <div className={styles.confirmContent}>
              <p>{currentTextos.deleteConfirmText}</p>
              <p className={styles.branchNameToDelete}>"{showDeleteConfirm.name}"</p>
              <p className={styles.confirmSubtext}>{currentTextos.deleteConfirmSubtext}</p>
            </div>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmCancelBtn}
                onClick={() => setShowDeleteConfirm(null)}
              >
                {currentTextos.cancelText}
              </button>
              <button 
                className={styles.confirmDeleteBtn}
                onClick={confirmDelete}
              >
                {currentTextos.deleteText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesTableSection;